import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/commands';
import { galleryService } from '../../services/gallery.service';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';

export const galleryCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('gallery')
    .setDescription('Sonagi Eagle Gallery 관련 명령어')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('태그 또는 키워드로 디자인 레퍼런스를 검색합니다.')
        .addStringOption((option) =>
          option.setName('query').setDescription('검색할 태그나 키워드').setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'search': {
          const query = interaction.options.getString('query', true);
          await interaction.deferReply();

          const results = await galleryService.searchReferences(query);

          if (results.length === 0) {
            await interaction.editReply({
              embeds: [createErrorEmbed(`'${query}'에 대한 검색 결과가 없습니다.`)],
            });
            return;
          }

          // 첫 번째 결과만 임베드로 보여주기 (더 발전시키면 Pagination 적용 가능)
          const image = results[0];
          const embed = new EmbedBuilder()
            .setColor(Colors.PRIMARY)
            .setTitle(`🎨 Gallery: ${image.name}`)
            .setImage(image.url)
            .addFields({ name: 'Tags', value: image.tags.map((t) => `\`${t}\``).join(' ') })
            .setFooter({ text: `Eagle Gallery Search Result • Keyword: ${query}` })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          break;
        }

        default:
          await interaction.reply({
            embeds: [createErrorEmbed('알 수 없는 서브커맨드입니다.')],
            ephemeral: true,
          });
      }
    } catch (error) {
      logger.error(`Error executing /gallery ${subcommand}`, error);
      const errorEmbed = createErrorEmbed('명령어 실행 중 오류가 발생했습니다.');
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
