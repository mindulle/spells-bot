import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMember,
} from 'discord.js';
import axios from 'axios';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  StreamType,
  AudioPlayer,
  VoiceConnection,
} from '@discordjs/voice';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';

interface RadioSession {
  player: AudioPlayer;
  connection: VoiceConnection;
}

// Store the audio player globally so we can stop it later
// In a production bot for multiple servers, this should be a Map<guildId, AudioPlayer>
const radioPlayers = new Map<string, RadioSession>();

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

    if (!voiceChannel && subcommand === 'play') {
      await interaction.reply({
        embeds: [createErrorEmbed('먼저 음성 채널에 접속해 주세요!')],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === 'play') {
      const channel = interaction.options.getString('channel', true);
      await interaction.deferReply();

      try {
        // 1. Get MBC Stream URL
        const response = await axios.get<string>(
          `https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=${channel}`,
          { timeout: 5000 }
        );

        const streamUrl = response.data.trim();
        if (!streamUrl || !streamUrl.startsWith('http')) {
          throw new Error('유효한 스트리밍 주소를 가져오지 못했습니다.');
        }

        logger.info(`Fetched MBC Stream URL: ${streamUrl}`);

        // 2. Join Voice Channel
        const connection = joinVoiceChannel({
          channelId: voiceChannel!.id,
          guildId: guildId,
          adapterCreator: voiceChannel!.guild.voiceAdapterCreator,
        });

        // 3. Create Audio Player & Resource
        const player = createAudioPlayer();
        const resource = createAudioResource(streamUrl, {
          inputType: StreamType.Arbitrary,
        });

        player.play(resource);
        connection.subscribe(player);

        radioPlayers.set(guildId, { player, connection });

        player.on(AudioPlayerStatus.Idle, () => {
          logger.info(`Radio player went idle in guild ${guildId}`);
          // Auto-reconnect or just leave if stream drops
          connection.destroy();
          radioPlayers.delete(guildId);
        });

        player.on('error', (error) => {
          logger.error(`Audio Player Error: ${error.message}`, error);
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
          logger.info(`Bot disconnected from voice channel in guild ${guildId}`);
          player.stop();
          connection.destroy();
          radioPlayers.delete(guildId);
        });

        // 4. Send Success Embed
        const channelName =
          channel === 'mfm' ? 'MBC FM4U' : channel === 'sfm' ? 'MBC 표준FM' : 'MBC 올댓뮤직';

        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle(`📻 ${channelName} 재생 시작`)
          .setDescription(
            `음성 채널 **${voiceChannel!.name}**에서 라디오 재생을 시작합니다.\n\n🎶 푸른밤, 옥상달빛입니다 등 다양한 라디오를 즐겨보세요!`
          )
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
    } else if (subcommand === 'stop') {
      const activeSession = radioPlayers.get(guildId);

      if (activeSession) {
        activeSession.player.stop();
        activeSession.connection.destroy();
        radioPlayers.delete(guildId);

        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle('📻 라디오 종료')
          .setDescription('재생을 중지하고 음성 채널에서 나갔습니다.');

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed('현재 이 서버에서 재생 중인 라디오가 없습니다.')],
          ephemeral: true,
        });
      }
    }
  },
};
