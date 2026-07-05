import { Client, Events, Message } from 'discord.js';
import { logger } from '../utils/logger';

const WEB_CLIP_CHANNEL_ID = '1519250071764336650';

export function registerMessageCreateEvent(client: Client): void {
  client.on(Events.MessageCreate, (message: Message) => {
    void (async () => {
      // Ignore messages from this bot itself to prevent infinite loops,
      // but process messages from other bots (like the Pipedream/Zapier webhook)
      if (message.author.id === client.user?.id) return;

      if (message.channelId === WEB_CLIP_CHANNEL_ID) {
        try {
          await message.react('✅');
          await message.react('❌');
          logger.info(`Added reactions to web-clip message: ${message.id}`);
        } catch (error) {
          logger.error(`Failed to add reactions to message ${message.id}`, error);
        }
      }
    })();
  });
}
