import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';
import { DEFAULT_USER_AGENT } from '../../utils/constants';

interface WikiSearchResponse {
  query?: {
    search?: Array<{
      title: string;
      snippet: string;
    }>;
  };
}

export const utilsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('utils')
    .setDescription('통합 유틸리티 커맨드 (Wiki, Photo, Food, Dog, Cat 등)')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('food')
        .setDescription('침샘을 자극하는 무작위 음식 사진을 추천해 드립니다.')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('photo').setDescription('무작위 고화질 사진을 가져옵니다.')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('dog').setDescription('귀여운 강아지 사진을 가져옵니다.')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('cat').setDescription('귀여운 고양이 사진을 가져옵니다.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('wiki')
        .setDescription('위키백과에서 단어를 검색합니다.')
        .addStringOption((option) =>
          option.setName('query').setDescription('검색할 단어').setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'food': {
        await interaction.deferReply();
        try {
          const response = await axios.get<{ image: string }>('https://foodish-api.com/api/', {
            headers: { 'User-Agent': DEFAULT_USER_AGENT },
            timeout: 5000,
          });
          const imageUrl = response.data.image;

          const embed = new EmbedBuilder()
            .setColor(Colors.PRIMARY)
            .setTitle('🍽️ 오늘의 메뉴 추천')
            .setDescription('먹음직스러운 사진을 가져왔어요! 오늘 식사 메뉴로 어떠세요?')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: 'Powered by Foodish API' });

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Failed to execute /utils food', error);
          await interaction.editReply({
            embeds: [createErrorEmbed('음식 사진을 가져오는 중 오류가 발생했습니다.')],
          });
        }
        break;
      }

      case 'photo': {
        await interaction.deferReply();
        try {
          const imageUrl = `https://picsum.photos/800/600?random=${Date.now()}`;

          const embed = new EmbedBuilder()
            .setColor(Colors.SUCCESS)
            .setTitle('📸 랜덤 사진 갤러리 (PhotoBox)')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: 'Powered by Lorem Picsum' });

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Failed to execute /utils photo', error);
          await interaction.editReply({
            embeds: [createErrorEmbed('사진을 가져오는 중 오류가 발생했습니다.')],
          });
        }
        break;
      }

      case 'dog': {
        await interaction.deferReply();
        try {
          const response = await axios.get<{ message: string; status: string }>(
            'https://dog.ceo/api/breeds/image/random',
            {
              headers: { 'User-Agent': DEFAULT_USER_AGENT },
              timeout: 5000,
            }
          );
          const imageUrl = response.data.message;

          const embed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle('🐶 힐링 타임 (Dog)')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: 'Powered by Dog API' });

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Failed to execute /utils dog', error);
          await interaction.editReply({
            embeds: [createErrorEmbed('강아지 사진을 가져오는 중 오류가 발생했습니다.')],
          });
        }
        break;
      }

      case 'cat': {
        await interaction.deferReply();
        try {
          const response = await axios.get<Array<{ url: string }>>(
            'https://api.thecatapi.com/v1/images/search',
            {
              headers: { 'User-Agent': DEFAULT_USER_AGENT },
              timeout: 5000,
            }
          );
          const imageUrl = response.data[0].url;

          const embed = new EmbedBuilder()
            .setColor(Colors.WARNING)
            .setTitle('🐱 힐링 타임 (Cat)')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: 'Powered by The Cat API' });

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Failed to execute /utils cat', error);
          await interaction.editReply({
            embeds: [createErrorEmbed('고양이 사진을 가져오는 중 오류가 발생했습니다.')],
          });
        }
        break;
      }

      case 'wiki': {
        const query = interaction.options.getString('query', true);
        await interaction.deferReply();

        try {
          const response = await axios.get<WikiSearchResponse>(
            `https://ko.wikipedia.org/w/api.php`,
            {
              params: {
                action: 'query',
                list: 'search',
                srsearch: query,
                format: 'json',
                utf8: 1,
              },
              headers: {
                'User-Agent': 'SpellsBot/1.1.0 (https://github.com/mindulle/spells-bot)',
              },
              timeout: 5000,
            }
          );

          const results = response.data.query?.search;

          if (!results || results.length === 0) {
            await interaction.editReply({
              embeds: [createErrorEmbed(`"${query}"에 대한 검색 결과가 없습니다.`)],
            });
            return;
          }

          const firstResult = results[0];
          const cleanSnippet = firstResult.snippet.replace(/<\/?[^>]+(>|$)/g, '');
          const articleUrl = `https://ko.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;

          const embed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle(`📖 ${firstResult.title}`)
            .setURL(articleUrl)
            .setDescription(`${cleanSnippet}...\n\n[자세히 보기](${articleUrl})`)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error(`Failed to search wiki for ${query}`, error);
          await interaction.editReply({
            embeds: [createErrorEmbed('위키 검색 중 오류가 발생했습니다.')],
          });
        }
        break;
      }

      default:
        await interaction.reply({
          embeds: [createErrorEmbed('알 수 없는 서브커맨드입니다.')],
          ephemeral: true,
        });
    }
  },
};
