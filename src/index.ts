import { Client, GatewayIntentBits, Partials } from 'discord.js';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';
dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [nodeProfilingIntegration()],
  // 성능 트레이싱 (운영에서는 트래픽에 맞게 조절 필요 - 현재는 10%만 수집하여 한도 보호)
  tracesSampleRate: 0.1,
  // 프로파일링 (에러나 성능 이슈 발생 시 CPU 스택 수집 - 10%만 수집)
  profilesSampleRate: 0.1,

  // beforeSend 훅: 불필요한 스팸 에러 필터링 및 개인정보(PII) 마스킹
  beforeSend(event, hint) {
    const error = hint.originalException as Error;
    if (error && error.message) {
      // 무시할 에러 예시: "Interaction has already been acknowledged."
      if (
        error.message.includes('already been acknowledged') ||
        error.message.includes('Unknown interaction')
      ) {
        return null; // Sentry로 보내지 않고 드랍(Drop)
      }
    }

    // PII (토큰 등) 스크러빙
    const eventString = JSON.stringify(event);
    if (eventString.includes(process.env.DISCORD_TOKEN || '')) {
      // 이 부분은 보안상 매우 중요하므로 토큰값이 로깅되지 않게 처리
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(
        eventString.replace(new RegExp(process.env.DISCORD_TOKEN, 'g'), '[FILTERED_TOKEN]')
      );
    }

    return event;
  },
});

import { logger } from './utils/logger';
import { assertEnvVariable } from './utils/error-handler';
import { registerReadyEvent } from './events/ready';
import { registerInteractionCreateEvent } from './events/interactionCreate';
import { registerMessageCreateEvent } from './events/messageCreate';
import { registerMessageReactionAddEvent } from './events/messageReactionAdd';
import { DashboardService } from './services/dashboard.service';
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

    // Start Live Dashboard Interval (every 5 minutes)
    void DashboardService.updateDashboard(client);
    setInterval(
      () => {
        void DashboardService.updateDashboard(client);
      },
      5 * 60 * 1000
    );

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
