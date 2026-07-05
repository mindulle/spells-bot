import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';
import { PaperclipService } from '../../services/paperclip';

export const paperclipCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('이슈')
    .setDescription('페이퍼클립(Paperclip) 플랫폼과 연동하여 이슈를 관리합니다.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('생성')
        .setDescription('새로운 이슈(백로그)를 생성합니다.')
        .addStringOption((option) =>
          option.setName('제목').setDescription('이슈의 제목을 입력하세요.').setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('내용')
            .setDescription('이슈의 상세 내용을 입력하세요. (선택사항)')
            .setRequired(false)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '생성') {
      const title = interaction.options.getString('제목', true);
      const description = interaction.options.getString('내용') || '상세 내용 없음';

      if (!process.env.PAPERCLIP_API_TOKEN) {
        await interaction.reply({
          embeds: [
            createErrorEmbed('현재 페이퍼클립 연동이 비활성화되어 있습니다. (API 토큰 누락)'),
          ],
          ephemeral: true,
        });
        return;
      }

      // 응답 지연 (API 통신 시간이 걸릴 수 있으므로 deferReply 처리)
      await interaction.deferReply();

      try {
        // Paperclip API를 호출하여 실제 이슈 생성
        const issue = await PaperclipService.createIssue(title, description);

        // 성공 시 응답할 디스코드 임베드 생성
        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle('✅ 새로운 이슈가 페이퍼클립에 등록되었습니다.')
          .setDescription(`**${issue.title}**\n\n${issue.description}`)
          .addFields(
            { name: '이슈 ID', value: issue.id || 'N/A', inline: true },
            { name: '상태', value: issue.status || 'Backlog', inline: true }
          )
          .setFooter({ text: 'Paperclip 연동' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('Error in /이슈 생성 command:', error);
        await interaction.editReply({
          embeds: [createErrorEmbed('이슈를 생성하는 중 서버 통신 오류가 발생했습니다.')],
        });
      }
    }
  },
};
