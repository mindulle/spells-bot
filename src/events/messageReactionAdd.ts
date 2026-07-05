import {
  Client,
  Events,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from 'discord.js';
import { logger } from '../utils/logger';

const WEB_CLIP_CHANNEL_ID = '1519250071764336650';

export function registerMessageReactionAddEvent(client: Client): void {
  client.on(
    Events.MessageReactionAdd,
    (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
      void (async () => {
        // Ignore reactions from the bot itself
        if (user.id === client.user?.id) return;

        // We only care about the web clip channel
        if (reaction.message.channelId !== WEB_CLIP_CHANNEL_ID) return;

        // We only care about the ✅ emoji
        if (reaction.emoji.name !== '✅') return;

        try {
          // If the message is partial, fetch it to get the content
          if (reaction.message.partial) {
            await reaction.message.fetch();
          }

          // Also fetch user if partial
          if (user.partial) {
            await user.fetch();
          }

          const message = reaction.message;
          const n8nWebhookUrl =
            process.env.N8N_WEBHOOK_URL_WEB_CLIP ||
            'http://100.113.113.72:5678/webhook/discord-web-clip';

          const payload = {
            content: message.content,
            author: user.username, // Using the user who reacted as the author/clipper
            channelId: message.channelId,
            messageId: message.id,
          };

          logger.info(`Sending web clip payload to n8n for message ${message.id}`);

          const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            logger.error(`n8n webhook returned status: ${response.status} ${response.statusText}`);
          } else {
            logger.info('Successfully forwarded clip to n8n webhook');
          }
        } catch (error) {
          logger.error('Error handling reaction add event', error);
        }
      })();
    }
  );
}
