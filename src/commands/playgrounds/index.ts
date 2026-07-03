import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import axios from 'axios';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';

interface SandboxApiResponse {
  status: string;
  message?: string;
  sandbox_url?: string;
  preview_url?: string;
  sandbox_id?: string;
}

export const playCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Sonagi Playgrounds 연동 커맨드')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('sandbox')
        .setDescription('GitHub의 예제 코드를 CodeSandbox 라이브 환경으로 띄웁니다.')
        .addStringOption((option) =>
          option
            .setName('path')
            .setDescription('실행할 예제의 경로 (예: Vanilla/Stateful/Animation/alternating-text)')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'sandbox': {
        const examplePath = interaction.options.getString('path', true);
        await interaction.deferReply();

        try {
          const apiUrl =
            process.env.PLAYGROUNDS_API_URL || 'https://sonagi-playgrounds.sonagi-dev.workers.dev';
          const response = await axios.get<SandboxApiResponse>(`${apiUrl}/sandbox`, {
            params: { path: examplePath },
          });

          const data = response.data;

          if (data.status === 'success' && data.sandbox_url && data.preview_url) {
            const embed = new EmbedBuilder()
              .setColor(Colors.SUCCESS)
              .setTitle('🎡 Sonagi Playgrounds Sandbox')
              .setDescription(
                `\`${examplePath}\` 예제 코드가 라이브 환경에 성공적으로 세팅되었습니다!`
              )
              .addFields({ name: 'Preview URL', value: data.preview_url })
              .setTimestamp();

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel('Open in CodeSandbox')
                .setStyle(ButtonStyle.Link)
                .setURL(data.sandbox_url)
            );

            await interaction.editReply({ embeds: [embed], components: [row] });
          } else {
            throw new Error(data.message || 'Unknown error from Playgrounds API');
          }
        } catch (_error: unknown) {
          logger.error(`Failed to generate sandbox for ${examplePath}`, _error);

          let errorMsg = '샌드박스 생성에 실패했습니다.';
          if (axios.isAxiosError(_error)) {
            errorMsg =
              _error.response?.data?.error || _error.response?.data?.message || _error.message;
          } else if (_error instanceof Error) {
            errorMsg = _error.message;
          }

          await interaction.editReply({ embeds: [createErrorEmbed(`API 통신 에러: ${errorMsg}`)] });
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
