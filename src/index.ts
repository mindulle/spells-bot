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
import { paperclipApprovalCommand } from './commands/paperclip/approval';
import { paperclipAgentCommand } from './commands/paperclip/agent';
import { paperclipPlanCommand } from './commands/paperclip/plan';
import { scheduleCommand } from './commands/notion/index';
import { ledgerCommand } from './commands/notion/ledger';
import { todoCommand } from './commands/todo/index';
import { addTodoContextMenu } from './commands/todo/context-menu';
import { n8nCommand } from './commands/n8n/index';
import { radioCommand } from './commands/radio/index';
import { helpCommand } from './commands/help/index';

import { Player } from 'discord-player';

// Load environment variables
dotenv.config();

export let player: Player;

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
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Reaction, Partials.User],
    });

    const { DefaultExtractors } = await import('@discord-player/extractor');
    player = new Player(client);
    await player.extractors.loadMulti(DefaultExtractors);

    // Global player event to handle VOD resuming
    player.events.on('playerStart', (queue, track) => {
      // Use metadata to extract resumeFrom
      const metadata = track.metadata as Record<string, unknown> | null;
      const resumeFrom = metadata?.resumeFrom;
      if (typeof resumeFrom === 'number') {
        logger.info(`Resuming track ${track.title} from ${resumeFrom}ms`);
        // Use a slight timeout to ensure the track has actually started decoding before seeking
        setTimeout(() => {
          queue.node.seek(resumeFrom).catch((err) => logger.error('Failed to seek', err));
        }, 500);
      }
    });

    // Register commands
    const commands: CommandMap = new Map([
      [infraCommand.data.name, infraCommand],
      [cdnCommand.data.name, cdnCommand],
      [galleryCommand.data.name, galleryCommand],
      [playCommand.data.name, playCommand],
      [utilsCommand.data.name, utilsCommand],
      [paperclipCommand.data.name, paperclipCommand],
      [paperclipApprovalCommand.data.name, paperclipApprovalCommand],
      [paperclipAgentCommand.data.name, paperclipAgentCommand],
      [paperclipPlanCommand.data.name, paperclipPlanCommand],
      [scheduleCommand.data.name, scheduleCommand],
      [ledgerCommand.data.name, ledgerCommand],
      [todoCommand.data.name, todoCommand],
      [addTodoContextMenu.data.name, addTodoContextMenu],
      [n8nCommand.data.name, n8nCommand],
      [radioCommand.data.name, radioCommand],
      [helpCommand.data.name, helpCommand],
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
