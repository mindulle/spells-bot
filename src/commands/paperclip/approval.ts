import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';
import { PaperclipService } from '../../services/paperclip';

export const paperclipApprovalCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('결재')
    .setDescription('페이퍼클립(Paperclip) 플랫폼의 결재를 관리합니다.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('대기')
        .setDescription('페이퍼클립에 대기 중인 결재 목록을 조회합니다.')
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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('승인')
        .setDescription('페이퍼클립의 대기 중인 결재를 승인합니다.')
        .addStringOption((option) =>
          option.setName('결재id').setDescription('승인할 결재 ID를 입력하세요.').setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('코멘트')
            .setDescription('승인 코멘트를 입력하세요. (선택사항)')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('거절')
        .setDescription('페이퍼클립의 대기 중인 결재를 거절합니다.')
        .addStringOption((option) =>
          option.setName('결재id').setDescription('거절할 결재 ID를 입력하세요.').setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('코멘트')
            .setDescription('거절 사유(코멘트)를 입력하세요. (권장사항)')
            .setRequired(false)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '대기') {
      const companyId = PaperclipService.getCompanyIdFromInteraction(interaction);

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
        const approvals = await PaperclipService.listApprovals(companyId, 'pending');

        if (!Array.isArray(approvals) || approvals.length === 0) {
          const emptyEmbed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle('📋 결재 대기 목록')
            .setDescription('현재 대기 중인 결재가 없습니다.')
            .setFooter({ text: 'Paperclip 연동' })
            .setTimestamp();

          await interaction.editReply({ embeds: [emptyEmbed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(Colors.INFO)
          .setTitle(`📋 결재 대기 목록 (총 ${approvals.length}건)`)
          .setFooter({ text: 'Paperclip 연동' })
          .setTimestamp();

        let description = '';
        const MAX_DISPLAY = 15;
        const displayApprovals = approvals.slice(0, MAX_DISPLAY);

        displayApprovals.forEach((approval) => {
          description += `⏳ **[${approval.id?.substring(0, 8) || 'N/A'}]** ${approval.title || '제목 없음'}\n`;
        });

        if (approvals.length > MAX_DISPLAY) {
          description += `\n*... 외 ${approvals.length - MAX_DISPLAY}건의 결재 대기가 더 있습니다.*`;
        }

        embed.setDescription(description || '결재를 불러올 수 없습니다.');

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('Error in /결재 대기 command:', error);
        await interaction.editReply({
          embeds: [createErrorEmbed('결재 대기 목록을 불러오는 중 서버 통신 오류가 발생했습니다.')],
        });
      }
    } else if (subcommand === '승인') {
      const approvalId = interaction.options.getString('결재id', true);
      const comment = interaction.options.getString('코멘트') || '';

      if (!process.env.PAPERCLIP_API_TOKEN) {
        await interaction.reply({
          embeds: [createErrorEmbed('현재 페이퍼클립 연동이 비활성화되어 있습니다.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      try {
        await PaperclipService.approve(approvalId, comment);

        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle('✅ 결재가 승인되었습니다.')
          .addFields(
            { name: '결재 ID', value: approvalId, inline: true },
            { name: '코멘트', value: comment || '없음', inline: false }
          )
          .setFooter({ text: 'Paperclip 연동' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('Error in /결재 승인 command:', error);
        await interaction.editReply({
          embeds: [
            createErrorEmbed('결재 승인 중 서버 통신 오류가 발생했습니다. 결재 ID를 확인해주세요.'),
          ],
        });
      }
    } else if (subcommand === '거절') {
      const approvalId = interaction.options.getString('결재id', true);
      const comment = interaction.options.getString('코멘트') || '';

      if (!process.env.PAPERCLIP_API_TOKEN) {
        await interaction.reply({
          embeds: [createErrorEmbed('현재 페이퍼클립 연동이 비활성화되어 있습니다.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      try {
        await PaperclipService.reject(approvalId, comment);

        const embed = new EmbedBuilder()
          .setColor(Colors.WARNING)
          .setTitle('❌ 결재가 거절되었습니다.')
          .addFields(
            { name: '결재 ID', value: approvalId, inline: true },
            { name: '사유(코멘트)', value: comment || '없음', inline: false }
          )
          .setFooter({ text: 'Paperclip 연동' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('Error in /결재 거절 command:', error);
        await interaction.editReply({
          embeds: [
            createErrorEmbed('결재 거절 중 서버 통신 오류가 발생했습니다. 결재 ID를 확인해주세요.'),
          ],
        });
      }
    }
  },
};
