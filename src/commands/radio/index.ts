import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMember,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} from 'discord.js';
import axios from 'axios';
import Parser from 'rss-parser';
import { Track } from 'discord-player';
import { player } from '../../index';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';

// Interfaces for API responses
interface ITunesResult {
  feedUrl?: string;
  collectionName?: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
}

const rssParser = new Parser();

export const radioCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('radio')
    .setDescription('MBC 라디오 및 팟캐스트(다시듣기)를 관리합니다.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('실시간 라디오 재생을 시작합니다.')
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
      subcommand
        .setName('vod')
        .setDescription('팟캐스트(다시듣기) 에피소드를 검색하고 재생합니다.')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('검색할 프로그램명 (예: 푸른밤, 배철수)')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('song')
        .setDescription('다시듣기 도중 원곡을 검색해서 끼어들기(새치기) 재생합니다.')
        .addStringOption((option) =>
          option
            .setName('title')
            .setDescription('재생할 원곡의 제목 (가수 + 제목)')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('stop').setDescription('재생을 중지하고 음성 채널에서 나갑니다.')
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

    // --- STOP ---
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

    // Must be in a voice channel for the other commands
    if (!voiceChannel) {
      await interaction.reply({
        embeds: [createErrorEmbed('먼저 음성 채널에 접속해 주세요!')],
        ephemeral: true,
      });
      return;
    }

    // --- PLAY (LIVE) ---
    if (subcommand === 'play') {
      const channel = interaction.options.getString('channel', true);
      await interaction.deferReply();

      try {
        const existingQueue = player.nodes.get(guildId);
        if (existingQueue && existingQueue.isPlaying()) existingQueue.delete();

        const response = await axios.get<string>(
          `https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=${channel}`,
          { timeout: 5000, responseType: 'text' }
        );

        const streamUrl = response.data.trim();
        if (!streamUrl || !streamUrl.startsWith('http')) {
          throw new Error('유효한 스트리밍 주소를 가져오지 못했습니다.');
        }

        const channelName =
          channel === 'mfm' ? 'MBC FM4U' : channel === 'sfm' ? 'MBC 표준FM' : 'MBC 올댓뮤직';

        logger.info(`Playing ${channelName} stream via discord-player: ${streamUrl}`);

        const track = new Track(player, {
          title: channelName,
          description: 'MBC Live Radio',
          author: 'MBC',
          url: streamUrl,
          source: 'arbitrary',
          thumbnail: 'https://i.imgur.com/8QGZ2u1.png',
          duration: '0:00',
          views: 0,
          requestedBy: interaction.user,
        });

        await player.play(voiceChannel, track, {
          nodeOptions: { metadata: interaction, selfDeaf: false, leaveOnEmpty: true },
        });

        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle(`📻 ${channelName} 재생 시작`)
          .setDescription(`음성 채널 **${voiceChannel.name}**에서 실시간 라디오를 재생합니다.`);
        await interaction.editReply({ embeds: [embed] });
      } catch (error: unknown) {
        logger.error('Failed to play radio', error);
        await interaction.editReply({
          embeds: [
            createErrorEmbed(
              `라디오 재생 실패: ${error instanceof Error ? error.message : '알 수 없는 에러'}`
            ),
          ],
        });
      }
    }

    // --- VOD (PODCAST) ---
    if (subcommand === 'vod') {
      const query = interaction.options.getString('query', true);
      await interaction.deferReply();

      try {
        // 1. Search iTunes for the podcast
        const searchRes = await axios.get<{ results: ITunesResult[] }>(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=podcast&limit=3`
        );
        const results = searchRes.data.results;

        if (!results || results.length === 0) {
          await interaction.editReply({
            embeds: [createErrorEmbed(`'${query}'에 해당하는 팟캐스트를 찾을 수 없습니다.`)],
          });
          return;
        }

        const feedUrl = results[0].feedUrl;
        const podcastName = results[0].collectionName;
        const artworkUrl = results[0].artworkUrl600 || results[0].artworkUrl100;

        if (!feedUrl || !podcastName) {
          throw new Error('팟캐스트 메타데이터가 부족합니다.');
        }

        // 2. Parse RSS Feed
        const feed = await rssParser.parseURL(feedUrl);
        const episodes = feed.items.slice(0, 10); // Get latest 10 episodes

        if (episodes.length === 0) {
          await interaction.editReply({
            embeds: [createErrorEmbed('이 팟캐스트에 등록된 에피소드가 없습니다.')],
          });
          return;
        }

        // 3. Create Select Menu
        const selectOptions = episodes
          .map((ep, index) => {
            let label = ep.title || `에피소드 ${index + 1}`;
            if (label.length > 100) label = label.substring(0, 97) + '...';
            const value = ep.enclosure?.url || '';

            return new StringSelectMenuOptionBuilder()
              .setLabel(label)
              .setDescription(
                ep.pubDate ? new Date(ep.pubDate).toLocaleDateString('ko-KR') : '날짜 없음'
              )
              .setValue(value.length > 100 ? value.substring(0, 100) : value); // Discord limitation
          })
          .filter((opt) => opt.data.value && opt.data.value.startsWith('http'))
          .slice(0, 10);

        if (selectOptions.length === 0) {
          await interaction.editReply({
            embeds: [createErrorEmbed('재생 가능한 오디오 파일을 찾을 수 없습니다.')],
          });
          return;
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('radio_vod_select')
          .setPlaceholder('재생할 에피소드를 선택하세요')
          .addOptions(selectOptions);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        const embed = new EmbedBuilder()
          .setColor(Colors.PRIMARY)
          .setTitle(`🎙️ ${podcastName} 다시듣기`)
          .setDescription('아래 메뉴에서 다시 듣고 싶은 에피소드를 선택해 주세요!')
          .setThumbnail(artworkUrl || null);

        const response = await interaction.editReply({ embeds: [embed], components: [row] });

        // 4. Collect Interaction
        const collector = response.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000,
        });

        collector.on('collect', (i) => {
          void (async () => {
            if (i.user.id !== interaction.user.id) {
              await i.reply({
                content: '명령어를 입력한 사용자만 선택할 수 있습니다.',
                ephemeral: true,
              });
              return;
            }

            const selectedUrl = i.values[0];
            // Find original episode object for metadata (matching by start of URL due to 100 char limit)
            const episode = episodes.find(
              (ep) => ep.enclosure?.url && ep.enclosure.url.startsWith(selectedUrl)
            );

            await i.deferUpdate();

            try {
              const existingQueue = player.nodes.get(guildId);
              if (existingQueue && existingQueue.isPlaying()) existingQueue.delete();

              const track = new Track(player, {
                title: episode?.title || podcastName,
                description: 'MBC VOD (다시듣기)',
                author: podcastName,
                url: episode?.enclosure?.url || selectedUrl,
                source: 'arbitrary',
                thumbnail: artworkUrl || 'https://i.imgur.com/8QGZ2u1.png',
                duration: '0:00',
                views: 0,
                requestedBy: i.user,
              });

              await player.play(voiceChannel, track, {
                nodeOptions: { metadata: interaction, selfDeaf: false, leaveOnEmpty: true },
              });

              const playEmbed = new EmbedBuilder()
                .setColor(Colors.SUCCESS)
                .setTitle(`🎙️ 재생 시작: ${episode?.title || podcastName}`)
                .setDescription(
                  `음성 채널 **${voiceChannel.name}**에서 다시듣기를 재생합니다.\n\n*(노래가 나오면 \`/radio song [제목]\` 명령어로 원곡을 튼 후 이어서 들을 수 있습니다!)*`
                )
                .setThumbnail(artworkUrl || null);

              await i.editReply({ embeds: [playEmbed], components: [] });
            } catch (err) {
              logger.error('Failed to play VOD', err);
              await i.editReply({
                embeds: [createErrorEmbed('에피소드 재생에 실패했습니다.')],
                components: [],
              });
            }
          })();
        });

        collector.on('end', (collected) => {
          if (collected.size === 0) {
            void interaction.editReply({ components: [] }).catch(() => {});
          }
        });
      } catch (error: unknown) {
        logger.error('Failed to fetch VOD', error);
        await interaction.editReply({
          embeds: [createErrorEmbed('팟캐스트 정보를 가져오는데 실패했습니다.')],
        });
      }
    }

    // --- SONG (INSERT/RESUME) ---
    if (subcommand === 'song') {
      const songTitle = interaction.options.getString('title', true);
      const queue = player.nodes.get(guildId);

      if (!queue || !queue.isPlaying()) {
        await interaction.reply({
          embeds: [createErrorEmbed('현재 재생 중인 라디오/팟캐스트가 없습니다.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      try {
        // 1. Search for the song
        const searchResult = await player.search(songTitle, { requestedBy: interaction.user });
        if (!searchResult || !searchResult.tracks.length) {
          await interaction.editReply({
            embeds: [createErrorEmbed(`'${songTitle}' 곡을 찾을 수 없습니다.`)],
          });
          return;
        }

        const songTrack = searchResult.tracks[0];
        const currentTrack = queue.currentTrack;
        const currentTimeMs = queue.node.streamTime;

        if (currentTrack) {
          // 2. Clone the current VOD/Radio track and add `resumeFrom` metadata
          const clonedVOD = new Track(player, {
            title: currentTrack.title,
            author: currentTrack.author,
            url: currentTrack.url,
            source: currentTrack.source as 'arbitrary',
            thumbnail: currentTrack.thumbnail,
            duration: currentTrack.duration,
            views: currentTrack.views,
            description: currentTrack.description,
            requestedBy: interaction.user,
          });

          // Metadata is readonly in types, but mutable in JS. Bypass TS strict check.
          Object.assign(clonedVOD, { metadata: { resumeFrom: currentTimeMs } });

          // 3. Queue manipulation
          queue.insertTrack(songTrack, 0); // Next song to play is the requested song
          queue.insertTrack(clonedVOD, 1); // After that, resume the VOD

          // Skip the current track to start the song immediately
          queue.node.skip();

          const embed = new EmbedBuilder()
            .setColor(Colors.SUCCESS)
            .setTitle(`🎶 팟캐스트 일시정지 & 원곡 재생`)
            .setDescription(
              `**${songTrack.title}** 재생을 시작합니다!\n원곡이 끝나면 아까 듣던 팟캐스트로 자동 복귀합니다.`
            )
            .setThumbnail(songTrack.thumbnail || null);

          await interaction.editReply({ embeds: [embed] });
        } else {
          await interaction.editReply({
            content: '현재 트랙 정보를 찾을 수 없어 끼어들기를 할 수 없습니다.',
          });
        }
      } catch (error: unknown) {
        logger.error('Failed to insert song', error);
        await interaction.editReply({ embeds: [createErrorEmbed('곡 끼어들기에 실패했습니다.')] });
      }
    }
  },
};
