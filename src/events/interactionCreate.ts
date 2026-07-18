import { Client, Events, Interaction } from 'discord.js';
import { logger } from '../utils/logger';
import { handleCommandError } from '../utils/error-handler';
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
          await handleCommandError(
            interaction as import('discord.js').ChatInputCommandInteraction,
            error
          );
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
        // 나중에 버튼 기능이 추가되면 여기서 처리할 수 있습니다.
        // 현재는 paperclip.ts 등의 내부에서 awaitMessageComponent로 처리 중일 수 있음
      } else if (interaction.isModalSubmit()) {
        // 나중에 모달 제출이 추가되면 여기서 처리할 수 있습니다.
      }
    })();
  });
}
