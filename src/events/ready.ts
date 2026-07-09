import { Client, Events } from 'discord.js';
import { logger } from '../utils/logger';
import { deployCommands } from '../scripts/deploy-commands';

export function registerReadyEvent(client: Client): void {
  client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Logged in as ${readyClient.user.tag}`);
    logger.info(`Serving ${readyClient.guilds.cache.size} guilds`);

    // Set bot status
    readyClient.user.setPresence({
      activities: [{ name: '/snippet, /component, /design' }],
      status: 'online',
    });

    // Auto-deploy commands dynamically to all joined guilds to prevent duplication
    deployCommands(Array.from(readyClient.guilds.cache.keys())).catch((err) => {
      logger.error('Failed to auto-deploy commands:', err);
    });
  });
}
