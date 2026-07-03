import { Client, Events } from 'discord.js';
import { logger } from '../utils/logger';

export function registerReadyEvent(client: Client): void {
  client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Logged in as ${readyClient.user.tag}`);
    logger.info(`Serving ${readyClient.guilds.cache.size} guilds`);

    // Set bot status
    readyClient.user.setPresence({
      activities: [{ name: '/snippet, /component, /design' }],
      status: 'online',
    });
  });
}
