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
        .addStringOption((option) =>
          option
            .setName('회사')
            .setDescription('생성할 회사를 선택하세요. (기본: Mindulle Studio)')
            .setRequired(false)
            .addChoices(
              { name: 'Mindulle Studio (기본)', value: 'mindulle' },
              { name: 'LIFE (개인)', value: 'life' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('조회')
        .setDescription('페이퍼클립에 등록된 최근 이슈 목록을 조회합니다.')
        .addIntegerOption((option) =>
          option
            .setName('개수')
            .setDescription('조회할 이슈 개수 (기본 5개, 최대 20개)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(20)
        )
        .addStringOption((option) =>
          option
            .setName('회사')
            .setDescription('조회할 회사를 선택하세요. (기본: Mindulle Studio)')
            .setRequired(false)
            .addChoices(
              { name: 'Mindulle Studio (기본)', value: 'mindulle' },
              { name: 'LIFE (개인)', value: 'life' }
            )
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '생성') {
      const title = interaction.options.getString('제목', true);
      const description = interaction.options.getString('내용') || '상세 내용 없음';
      const companyChoice = interaction.options.getString('회사') || 'mindulle';

      const defaultCompanyId = process.env.PAPERCLIP_COMPANY_ID_MINDULLE;
      const lifeCompanyId = process.env.PAPERCLIP_COMPANY_ID_LIFE;
      const companyId = companyChoice === 'life' ? lifeCompanyId : defaultCompanyId;

      if (!process.env.PAPERCLIP_API_TOKEN || !companyId) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              '현재 페이퍼클립 연동이 비활성화되어 있습니다. (API 토큰 또는 회사 ID 누락)'
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      // 응답 지연 (API 통신 시간이 걸릴 수 있으므로 deferReply 처리)
      await interaction.deferReply();

      try {
        // Paperclip API를 호출하여 실제 이슈 생성
        const issue = await PaperclipService.createIssue(companyId, title, description);

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
    } else if (subcommand === '조회') {
      const limit = interaction.options.getInteger('개수') || 5;
      const companyChoice = interaction.options.getString('회사') || 'mindulle';

      const defaultCompanyId = process.env.PAPERCLIP_COMPANY_ID_MINDULLE;
      const lifeCompanyId = process.env.PAPERCLIP_COMPANY_ID_LIFE;
      const companyId = companyChoice === 'life' ? lifeCompanyId : defaultCompanyId;

      if (!process.env.PAPERCLIP_API_TOKEN || !companyId) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              '현재 페이퍼클립 연동이 비활성화되어 있습니다. (API 토큰 또는 회사 ID 누락)'
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      try {
        const issues = await PaperclipService.listIssues(companyId, limit);

        if (!Array.isArray(issues) || issues.length === 0) {
          const emptyEmbed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle('📋 이슈 목록')
            .setDescription('현재 등록된 이슈가 없습니다.')
            .setFooter({ text: 'Paperclip 연동' })
            .setTimestamp();

          await interaction.editReply({ embeds: [emptyEmbed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(Colors.INFO)
          .setTitle(`📋 최근 이슈 목록 (Top ${issues.length})`)
          .setFooter({ text: 'Paperclip 연동' })
          .setTimestamp();

        let description = '';
        issues.forEach((issue) => {
          // 상태에 따른 이모지 표시
          let statusEmoji = '⚪';
          if (issue.status === 'done' || issue.status === 'completed') statusEmoji = '✅';
          else if (issue.status === 'in_progress') statusEmoji = '🏃';
          else if (issue.status === 'blocked') statusEmoji = '🚫';
          else if (issue.status === 'cancelled') statusEmoji = '❌';

          description += `${statusEmoji} **[${issue.id?.substring(0, 8) || 'N/A'}]** ${issue.title || '제목 없음'}\n`;
        });

        embed.setDescription(description || '이슈를 불러올 수 없습니다.');

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('Error in /이슈 조회 command:', error);
        await interaction.editReply({
          embeds: [createErrorEmbed('이슈 목록을 불러오는 중 서버 통신 오류가 발생했습니다.')],
        });
      }
    }
  },
};
