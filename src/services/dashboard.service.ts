import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { logger } from '../utils/logger';
import { healthService } from './health.service';
import { NotionService } from './notion';
import { PaperclipService } from './paperclip';
import { Colors } from '../utils/embed-builder';

export class DashboardService {
  private static isUpdating = false;

  static async updateDashboard(client: Client): Promise<void> {
    if (this.isUpdating) return;

    const channelId = process.env.DASHBOARD_CHANNEL_ID;
    if (!channelId) return;

    this.isUpdating = true;

    try {
      const channel = (await client.channels.fetch(channelId)) as TextChannel;
      if (!channel || !channel.isTextBased()) {
        logger.warn('DASHBOARD_CHANNEL_ID is invalid or not a text channel.');
        return;
      }

      // 1. Gather Data
      const [health, schedules] = await Promise.all([
        healthService.getSystemStatus(),
        NotionService.getTodaySchedules().catch(() => []),
      ]);

      // Paperclip (Mindulle Studio)
      let pendingApprovals = 0;
      try {
        const companyId = process.env.PAPERCLIP_COMPANY_ID_MINDULLE;
        if (companyId && process.env.PAPERCLIP_API_TOKEN) {
          const approvals = await PaperclipService.listApprovals(companyId, 'pending');
          pendingApprovals = approvals.length;

          // You could also fetch agent status if there's an API for it,
          // but for now we'll just mock it or skip it if there isn't.
        }
      } catch (e) {
        logger.warn('Failed to fetch Paperclip stats for dashboard', e);
      }

      // 2. Build Embed
      const isAllHealthy = health.k3s && health.minio && health.n8n;

      const embed = new EmbedBuilder()
        .setColor(isAllHealthy ? Colors.SUCCESS : Colors.ERROR)
        .setTitle('🖥️ Sonagi Live Dashboard')
        .setDescription('이 메시지는 시스템 상태를 실시간으로 모니터링하여 자동으로 갱신됩니다.')
        .addFields(
          {
            name: '⚙️ 인프라 상태 (DevOps)',
            value: `K3s Cluster: ${health.k3s ? '🟢 Online' : '🔴 Offline'}\nMinIO Storage: ${health.minio ? '🟢 Online' : '🔴 Offline'}\nn8n Workflows: ${health.n8n ? '🟢 Online' : '🔴 Offline'}`,
            inline: false,
          },
          {
            name: '🤖 AI 에이전트 (Paperclip)',
            value: `결재 대기 중: **${pendingApprovals}건**`,
            inline: true,
          },
          {
            name: '📅 오늘의 일정 (Notion)',
            value:
              schedules.length > 0
                ? schedules
                    .map((s) => `• ${s.isDone ? '✅' : '⏳'} ${s.title}`)
                    .slice(0, 5)
                    .join('\n') + (schedules.length > 5 ? `\n...외 ${schedules.length - 5}건` : '')
                : '오늘은 예정된 일정이 없습니다.',
            inline: true,
          }
        )
        .setFooter({ text: '마지막 갱신' })
        .setTimestamp();

      // 3. Find existing dashboard message or send a new one
      const messages = await channel.messages.fetch({ limit: 50 });
      const existingMessage = messages.find(
        (m) => m.author.id === client.user?.id && m.embeds[0]?.title === '🖥️ Sonagi Live Dashboard'
      );

      if (existingMessage) {
        await existingMessage.edit({ embeds: [embed] });
      } else {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      logger.error('Error updating live dashboard:', error);
    } finally {
      this.isUpdating = false;
    }
  }
}
