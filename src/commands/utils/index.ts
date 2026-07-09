import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
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

interface PokeApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{ type: { name: string } }>;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
}

interface PokemonEntry {
  name: string;
  label: string;
}

const POKEMON_LIST: PokemonEntry[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'pokemon-list.json'), 'utf-8')
) as PokemonEntry[];

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
        .setName('pokemon')
        .setDescription('포켓몬 도감 정보를 가져옵니다.')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('포켓몬 영문 이름 또는 도감 번호')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('wiki')
        .setDescription('위키백과에서 단어를 검색합니다.')
        .addStringOption((option) =>
          option.setName('query').setDescription('검색할 단어').setRequired(true)
        )
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const filtered = POKEMON_LIST.filter(
      (poke: PokemonEntry) =>
        poke.name.toLowerCase().includes(focusedValue) ||
        poke.label.toLowerCase().includes(focusedValue)
    ).slice(0, 25);

    await interaction.respond(
      filtered.map((poke: PokemonEntry) => ({ name: poke.label, value: poke.name }))
    );
  },

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
          const response = await axios.get<{ url: string }>(
            'https://random.dog/woof.json?filter=mp4,webm',
            {
              headers: { 'User-Agent': DEFAULT_USER_AGENT },
              timeout: 5000,
            }
          );
          const imageUrl = response.data.url;

          const embed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle('🐶 힐링 타임 (Dog)')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: 'Powered by random.dog' });

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

      case 'pokemon': {
        const rawQuery = interaction.options.getString('query', true).toLowerCase().trim();
        const query = encodeURIComponent(rawQuery.replace(/[\s.]+/g, '-'));
        await interaction.deferReply();

        try {
          const response = await axios.get<PokeApiResponse>(
            `https://pokeapi.co/api/v2/pokemon/${query}`,
            {
              headers: { 'User-Agent': DEFAULT_USER_AGENT },
              timeout: 5000,
            }
          );

          const data = response.data;
          const imageUrl =
            data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default;
          const types = data.types?.map((t) => t.type.name).join(', ') || 'Unknown';
          const height = (data.height / 10).toFixed(1);
          const weight = (data.weight / 10).toFixed(1);

          const embed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle(`Pokédex: #${data.id} ${data.name.toUpperCase()}`)
            .addFields(
              { name: '타입 (Types)', value: types, inline: true },
              { name: '키 (Height)', value: `${height}m`, inline: true },
              { name: '몸무게 (Weight)', value: `${weight}kg`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Powered by PokeAPI' });

          if (imageUrl) {
            embed.setThumbnail(imageUrl);
          }

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error(`Failed to fetch pokemon info for ${query}`, error);
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            await interaction.editReply({
              embeds: [
                createErrorEmbed(
                  `${rawQuery} 포켓몬을 찾을 수 없습니다. 영문 이름이나 정확한 도감 번호를 입력해 주세요.`
                ),
              ],
            });
          } else {
            await interaction.editReply({
              embeds: [createErrorEmbed('포켓몬 정보를 가져오는 중 오류가 발생했습니다.')],
            });
          }
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
              embeds: [createErrorEmbed(`${query}에 대한 검색 결과가 없습니다.`)],
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
