import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';

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
    .setDescription('통합 유틸리티 커맨드 (Wiki, Photo, Food 등)')
    .addSubcommand((subcommand) =>
      subcommand.setName('food').setDescription('랜덤 음식/메뉴를 추천해 드립니다.')
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
          const foods = [
            '제육볶음',
            '돈까스',
            '국밥',
            '마라탕',
            '초밥',
            '햄버거',
            '피자',
            '치킨',
            '샐러드',
            '짜장면',
            '김치찌개',
            '된장찌개',
            '파스타',
            '샌드위치',
            '냉면',
          ];
          const randomFood = foods[Math.floor(Math.random() * foods.length)];

          const embed = new EmbedBuilder()
            .setColor(Colors.PRIMARY)
            .setTitle('🍽️ 오늘의 메뉴 추천')
            .setDescription(`오늘 식사는 **${randomFood}** 어떠세요?`)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Failed to execute /utils food', error);
          await interaction.editReply({
            embeds: [createErrorEmbed('메뉴 추천 중 오류가 발생했습니다.')],
          });
        }
        break;
      }

      case 'wiki': {
        const query = interaction.options.getString('query', true);
        await interaction.deferReply();

        try {
          // Wikipedia Search API
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
          // title, snippet (HTML 포함되어 있으므로 간단히 정규식으로 태그 제거)
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
