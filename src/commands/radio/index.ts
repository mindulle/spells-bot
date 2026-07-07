import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMember,
} from 'discord.js';
import axios from 'axios';
import { Track } from 'discord-player';
import { player } from '../../index';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';

export const radioCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('radio')
    .setDescription('MBC 라디오 스트리밍을 음성 채널에서 재생합니다.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('라디오 재생을 시작합니다.')
        .addStringOption((option) =>
          option
            .setName('channel')
            .setDescription('재생할 채널을 선택하세요')
            .setRequired(true)
            .addChoices(
              { name: 'MBC FM4U (옥상달빛 등)', value: 'mfm' },
              { name: 'MBC 표준FM', value: 'sfm' },
              { name: 'MBC 올댓뮤직', value: 'chm' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('stop').setDescription('라디오 재생을 중지하고 음성 채널에서 나갑니다.')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        embeds: [createErrorEmbed('이 명령어는 서버 내의 음성 채널에서만 사용할 수 있습니다.')],
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (subcommand === 'stop') {
      const queue = player.nodes.get(guildId);
      if (queue && queue.isPlaying()) {
        queue.delete();
        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle('📻 라디오 종료')
          .setDescription('재생을 중지하고 음성 채널에서 나갔습니다.');
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed('현재 재생 중인 라디오가 없습니다.')],
          ephemeral: true,
        });
      }
      return;
    }

    if (subcommand === 'play') {
      if (!voiceChannel) {
        await interaction.reply({
          embeds: [createErrorEmbed('먼저 음성 채널에 접속해 주세요!')],
          ephemeral: true,
        });
        return;
      }

      const channel = interaction.options.getString('channel', true);
      await interaction.deferReply();

      try {
        // Stop existing queue if any
        const existingQueue = player.nodes.get(guildId);
        if (existingQueue && existingQueue.isPlaying()) {
          existingQueue.delete();
        }

        const response = await axios.get<string>(
          `https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=${channel}`,
          { timeout: 5000, responseType: 'text' }
        );

        const streamUrl = response.data.trim();
        if (!streamUrl || !streamUrl.startsWith('http')) {
          throw new Error('유효한 스트리밍 주소를 가져오지 못했습니다.');
        }

        const channelName = channel === 'mfm' ? 'MBC FM4U' : channel === 'sfm' ? 'MBC 표준FM' : 'MBC 올댓뮤직';
        
        logger.info(`Playing ${channelName} stream via discord-player: ${streamUrl}`);

        // Manually create a Track to bypass extractors
        const track = new Track(player, {
          title: channelName,
          description: 'MBC Radio Stream',
          author: 'MBC',
          url: streamUrl,
          source: 'arbitrary',
          thumbnail: 'https://i.imgur.com/8QGZ2u1.png',
          duration: '0:00',
          views: 0,
          requestedBy: interaction.user,
        });

        await player.play(voiceChannel, track, {
          nodeOptions: {
            metadata: interaction,
            selfDeaf: false,
            leaveOnEmpty: true,
            leaveOnEnd: false, // Don't leave immediately if stream drops briefly
          },
        });

        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle(`📻 ${channelName} 재생 시작`)
          .setDescription(`음성 채널 **${voiceChannel.name}**에서 라디오 재생을 시작합니다.\n\n🎶 푸른밤, 옥상달빛입니다 등 다양한 라디오를 즐겨보세요!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error: unknown) {
        logger.error('Failed to play radio', error);
        let errorMsg = '알 수 없는 오류가 발생했습니다.';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        await interaction.editReply({
          embeds: [createErrorEmbed(`라디오 스트리밍을 시작하지 못했습니다: ${errorMsg}`)],
        });
      }
    }
  },
};
