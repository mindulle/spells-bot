import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { assertEnvVariable } from './utils/error-handler';
import { registerReadyEvent } from './events/ready';
import { registerInteractionCreateEvent } from './events/interactionCreate';
import { registerMessageCreateEvent } from './events/messageCreate';
import { registerMessageReactionAddEvent } from './events/messageReactionAdd';
import type { CommandMap } from './types/commands';

// Import commands
import { infraCommand } from './commands/infra/index';
import { cdnCommand } from './commands/cdn/index';
import { galleryCommand } from './commands/gallery/index';
import { playCommand } from './commands/playgrounds/index';
import { utilsCommand } from './commands/utils/index';
import { paperclipCommand } from './commands/paperclip/index';

// Load environment variables
dotenv.config();

async function main() {
  try {
    logger.info('Starting Spells Bot...');

    // Validate required environment variables
    const token = assertEnvVariable('DISCORD_TOKEN');
    assertEnvVariable('DISCORD_CLIENT_ID');

    // Optional environment variables
    if (!process.env.PAPERCLIP_API_TOKEN) {
      logger.warn('PAPERCLIP_API_TOKEN is not set. /이슈 command will not work.');
    }

    // Create Discord client
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Reaction, Partials.User],
    });

    // Register commands
    const commands: CommandMap = new Map([
      [infraCommand.data.name, infraCommand],
      [cdnCommand.data.name, cdnCommand],
      [galleryCommand.data.name, galleryCommand],
      [playCommand.data.name, playCommand],
      [utilsCommand.data.name, utilsCommand],
      [paperclipCommand.data.name, paperclipCommand],
    ]);

    logger.info(`Registered ${commands.size} commands`);

    // Register event handlers
    registerReadyEvent(client);
    registerInteractionCreateEvent(client, commands);
    registerMessageCreateEvent(client);
    registerMessageReactionAddEvent(client);

    // Login to Discord
    await client.login(token);

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      void client.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      void client.destroy();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start bot', error);
    process.exit(1);
  }
}

// Start the bot
main().catch((error) => {
  logger.error('Unhandled error in main', error);
  process.exit(1);
});
