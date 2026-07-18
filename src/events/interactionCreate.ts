import {
  Client,
  Events,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { logger } from '../utils/logger';
import { handleCommandError } from '../utils/error-handler';
import { PaperclipService } from '../services/paperclip';
import { Colors, createErrorEmbed } from '../utils/embed-builder';
import type { CommandMap } from '../types/commands';

export function registerInteractionCreateEvent(client: Client, commands: CommandMap): void {
  client.on(Events.InteractionCreate, (interaction: Interaction) => {
    void (async () => {
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const command = commands.get(interaction.commandName);

        if (!command) {
          logger.warn(`Unknown command: ${interaction.commandName}`);
          return;
        }

        try {
          logger.info('Command execution started', {
            command: interaction.commandName,
            user: interaction.user.tag,
            guild: interaction.guild?.name,
          });

          await command.execute(interaction);

          logger.info('Command execution completed', {
            command: interaction.commandName,
          });
        } catch (error) {
          logger.error('Command execution failed', error);
          await handleCommandError(interaction as ChatInputCommandInteraction, error);
        }
      } else if (interaction.isAutocomplete()) {
        const command = commands.get(interaction.commandName);

        if (!command || !command.autocomplete) {
          return;
        }

        try {
          await command.autocomplete(interaction);
        } catch (error) {
          logger.error('Autocomplete failed', error);
        }
      } else if (interaction.isButton()) {
        const customId = interaction.customId;

        if (customId.startsWith('approve_')) {
          const approvalId = customId.replace('approve_', '');
          try {
            await interaction.deferUpdate(); // Update message state
            await PaperclipService.approve(approvalId, '디스코드 버튼을 통해 승인되었습니다.');

            const originalEmbed = interaction.message?.embeds[0];
            const embed = originalEmbed
              ? EmbedBuilder.from(originalEmbed)
                  .setColor(Colors.SUCCESS)
                  .setTitle(originalEmbed.title?.replace('⏳', '✅') || '✅ 결재 승인 완료')
              : new EmbedBuilder()
                  .setColor(Colors.SUCCESS)
                  .setTitle('✅ 결재 승인 완료')
                  .setDescription(`결재 ID \`${approvalId}\`가 승인되었습니다.`);

            await interaction.editReply({ embeds: [embed], components: [] });
          } catch (error) {
            logger.error('Failed to approve via button', error);
            await interaction.followUp({
              content: '❌ 승인 처리 중 오류가 발생했습니다.',
              ephemeral: true,
            });
          }
        } else if (customId.startsWith('reject_init_')) {
          const approvalId = customId.replace('reject_init_', '');

          const modal = new ModalBuilder()
            .setCustomId(`modal_reject_${approvalId}`)
            .setTitle('반려 사유 입력');

          const reasonInput = new TextInputBuilder()
            .setCustomId('reject_reason')
            .setLabel('어떤 점을 수정해야 하나요?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

          const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
            reasonInput
          );
          modal.addComponents(firstActionRow);

          await interaction.showModal(modal);
        }
      } else if (interaction.isModalSubmit()) {
        const customId = interaction.customId;

        if (customId.startsWith('modal_reject_')) {
          const approvalId = customId.replace('modal_reject_', '');
          const reason = interaction.fields.getTextInputValue('reject_reason');

          try {
            await interaction.deferUpdate();
            await PaperclipService.reject(approvalId, reason);

            const originalEmbed = interaction.message?.embeds[0];
            const embed = originalEmbed
              ? EmbedBuilder.from(originalEmbed)
                  .setColor(Colors.ERROR)
                  .setTitle(originalEmbed.title?.replace('⏳', '❌') || '❌ 결재 반려 완료')
                  .addFields({ name: '반려 사유', value: reason, inline: false })
              : new EmbedBuilder()
                  .setColor(Colors.WARNING)
                  .setTitle('❌ 결재 반려 완료')
                  .setDescription(
                    `결재 ID \`${approvalId}\`가 다음 사유로 반려되었습니다:\n> ${reason}`
                  );

            await interaction.editReply({ embeds: [embed], components: [] });
          } catch (error) {
            logger.error('Failed to reject via modal', error);
            await interaction.followUp({
              content: '❌ 반려 처리 중 오류가 발생했습니다.',
              ephemeral: true,
            });
          }
        } else if (customId.startsWith('modal_issue_create_')) {
          const companyId = customId.replace('modal_issue_create_', '');
          const title = interaction.fields.getTextInputValue('issue_title');
          const description = interaction.fields.getTextInputValue('issue_description');

          try {
            await interaction.deferReply();

            const issue = await PaperclipService.createIssue(companyId, title, description);

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
            logger.error('Failed to create issue via modal', error);
            await interaction.editReply({
              embeds: [createErrorEmbed('이슈를 생성하는 중 서버 통신 오류가 발생했습니다.')],
            });
          }
        }
      }
    })();
  });
}
