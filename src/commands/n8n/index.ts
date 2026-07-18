import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';
import { n8nClient } from '../../clients/n8n.client';

export const n8nCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('n8n')
    .setDescription('n8n 워크플로우 및 상태를 관리합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand.setName('상태').setDescription('n8n 서버의 상태(Health Check)를 확인합니다.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('실행')
        .setDescription('특정 n8n Webhook을 트리거합니다.')
        .addStringOption((option) =>
          option
            .setName('url')
            .setDescription('트리거할 Webhook URL을 입력하세요.')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('데이터')
            .setDescription('JSON 형태의 페이로드를 입력하세요.')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('기록').setDescription('최근 실행된 워크플로우 상태를 조회합니다.')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '상태') {
      await interaction.deferReply();
      const isHealthy = await n8nClient.ping();

      const embed = new EmbedBuilder()
        .setTitle('🛠️ n8n 서버 상태')
        .setDescription(
          isHealthy
            ? 'n8n 서버가 **정상적으로 동작 중**입니다. ✅'
            : 'n8n 서버와 연결할 수 없습니다. ❌'
        )
        .setColor(isHealthy ? Colors.SUCCESS : Colors.ERROR)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === '실행') {
      const url = interaction.options.getString('url', true);

      try {
        const parsedUrl = new URL(url);
        const allowedUrl = process.env.N8N_API_URL || 'http://localhost:5678';
        const allowedHost = new URL(allowedUrl).host;

        if (parsedUrl.host !== allowedHost) {
          await interaction.reply({
            embeds: [
              createErrorEmbed(
                '허용되지 않은 도메인의 Webhook URL입니다. (n8n 호스트와 일치해야 합니다)'
              ),
            ],
            ephemeral: true,
          });
          return;
        }
      } catch (e) {
        await interaction.reply({
          embeds: [createErrorEmbed('올바르지 않은 Webhook URL 형식입니다.')],
          ephemeral: true,
        });
        return;
      }

      const dataStr = interaction.options.getString('데이터') || '{}';

      let payload: unknown;
      try {
        payload = JSON.parse(dataStr) as unknown;
      } catch (e) {
        await interaction.reply({
          embeds: [createErrorEmbed('잘못된 JSON 형식입니다. 올바른 JSON 데이터를 입력해주세요.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();
      try {
        const responseData = await n8nClient.triggerWebhook(url, payload);
        const embed = new EmbedBuilder()
          .setTitle('✅ n8n Webhook 실행 성공')
          .setDescription(
            `요청이 성공적으로 전달되었습니다.\n\`\`\`json\n${JSON.stringify(responseData, null, 2).substring(0, 2000)}\n\`\`\``
          )
          .setColor(Colors.SUCCESS)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error: unknown) {
        logger.error('Failed to trigger n8n webhook via command', error);
        await interaction.editReply({
          embeds: [
            createErrorEmbed(
              `Webhook 실행 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
            ),
          ],
        });
      }
    } else if (subcommand === '기록') {
      await interaction.deferReply();
      try {
        const executions = await n8nClient.getRecentExecutions(5);

        if (!executions || executions.length === 0) {
          const emptyEmbed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle('📋 최근 n8n 실행 기록')
            .setDescription('최근 실행된 워크플로우 기록이 없습니다.')
            .setTimestamp();
          await interaction.editReply({ embeds: [emptyEmbed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(Colors.INFO)
          .setTitle('📋 최근 n8n 실행 기록 (최대 5건)')
          .setTimestamp();

        let description = '';
        executions.forEach((rawExec, index) => {
          const exec = rawExec as {
            status?: string;
            workflowData?: { name?: string };
            workflowId?: string;
            startedAt?: string;
          };
          const statusIcon =
            exec.status === 'success' ? '✅' : exec.status === 'error' ? '❌' : '⏳';
          const workflowName = exec.workflowData?.name || `Workflow ID: ${exec.workflowId}`;
          const time = new Date(exec.startedAt || '').toLocaleString('ko-KR');
          description += `${index + 1}. ${statusIcon} **${workflowName}**\n   └ 상태: ${exec.status} | 시작: ${time}\n`;
        });

        embed.setDescription(description);
        await interaction.editReply({ embeds: [embed] });
      } catch (error: unknown) {
        logger.error('Failed to fetch n8n executions via command', error);
        await interaction.editReply({
          embeds: [
            createErrorEmbed(
              `기록 조회 실패: 환경변수(N8N_API_URL, N8N_API_KEY) 확인이 필요합니다. (${error instanceof Error ? error.message : 'Unknown error'})`
            ),
          ],
        });
      }
    }
  },
};
