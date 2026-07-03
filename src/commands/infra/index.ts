import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/commands';
import { healthService } from '../../services/health.service';
import { Colors } from '../../utils/embed-builder';

export const infraCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('infra')
    .setDescription('Sonagi 인프라 상태 및 관리 커맨드')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('status')
        .setDescription('K3s, MinIO, n8n 등 주요 인프라의 헬스체크 결과를 조회합니다.')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() === 'status') {
      await interaction.deferReply();

      const status = await healthService.getSystemStatus();
      const isAllHealthy = status.k3s && status.minio && status.n8n;

      const embed = new EmbedBuilder()
        .setColor(isAllHealthy ? Colors.SUCCESS : Colors.ERROR)
        .setTitle('🖥️ Sonagi Infrastructure Status')
        .setDescription(
          isAllHealthy
            ? '모든 시스템이 정상적으로 가동 중입니다.'
            : '일부 시스템에 장애가 감지되었습니다.'
        )
        .addFields(
          { name: 'K3s Cluster', value: status.k3s ? '🟢 Online' : '🔴 Offline', inline: true },
          { name: 'MinIO Storage', value: status.minio ? '🟢 Online' : '🔴 Offline', inline: true },
          { name: 'n8n Workflows', value: status.n8n ? '🟢 Online' : '🔴 Offline', inline: true }
        )
        .setTimestamp(status.timestamp);

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
