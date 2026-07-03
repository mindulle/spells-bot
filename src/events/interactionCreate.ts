import { Client, Events, Interaction } from 'discord.js';
import { logger } from '../utils/logger';
import { handleCommandError } from '../utils/error-handler';
import type { CommandMap } from '../types/commands';

export function registerInteractionCreateEvent(client: Client, commands: CommandMap): void {
  client.on(Events.InteractionCreate, (interaction: Interaction) => {
    void (async () => {
      if (!interaction.isChatInputCommand()) return;

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
        await handleCommandError(interaction, error);
      }
    })();
  });
}
