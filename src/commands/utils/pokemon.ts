import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';
import axios from 'axios';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';
import { DEFAULT_USER_AGENT } from '../../utils/constants';
import { PokemonData } from '../../types/pokemon';
import * as fs from 'fs';
import * as path from 'path';

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
    .setDescription('통합 유틸리티 커맨드')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('pokemon')
        .setDescription('포켓몬 도감 정보를 가져옵니다.')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('포켓몬 영문 이름')
            .setRequired(true)
            .setAutocomplete(true)
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
    const query = interaction.options.getString('query', true).toLowerCase().trim();
    await interaction.deferReply();

    try {
      const response = await axios.get<PokemonData>(`https://pokeapi.co/api/v2/pokemon/${query}`, {
        headers: { 'User-Agent': DEFAULT_USER_AGENT },
        timeout: 5000,
      });

      const data = response.data;
      const imageUrl =
        data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default;

      const embed = new EmbedBuilder()
        .setColor(Colors.INFO)
        .setTitle(`Pokédex: #${data.id} ${data.name.toUpperCase()}`)
        .setThumbnail(imageUrl || null)
        .addFields(
          { name: '타입', value: data.types.map((t) => t.type.name).join(', '), inline: true },
          { name: '키', value: `${(data.height / 10).toFixed(1)}m`, inline: true },
          { name: '몸무게', value: `${(data.weight / 10).toFixed(1)}kg`, inline: true }
        )
        .setFooter({ text: 'Powered by PokeAPI' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error(`Failed to fetch pokemon info for ${query}`, error);
      await interaction.editReply({
        embeds: [createErrorEmbed(`"${query}" 포켓몬을 찾을 수 없어요!`)],
      });
    }
  },
};
