import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/commands';
import { Colors, createErrorEmbed } from '../../utils/embed-builder';
import { logger } from '../../utils/logger';
import { NotionService } from '../../services/notion';

export const todoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('할일')
    .setDescription('노션(Notion)의 할 일(To-do)을 관리합니다.')
    .addSubcommand((subcommand) =>
      subcommand.setName('목록').setDescription('현재 남아있는 할 일 목록을 조회합니다.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('추가')
        .setDescription('새로운 할 일을 추가합니다.')
        .addStringOption((option) =>
          option
            .setName('내용')
            .setDescription('할 일의 내용(제목)을 입력하세요.')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('우선순위')
            .setDescription('우선순위를 선택하세요.')
            .setRequired(false)
            .addChoices(
              { name: '높음 (High)', value: 'High' },
              { name: '중간 (Medium)', value: 'Medium' },
              { name: '낮음 (Low)', value: 'Low' }
            )
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (!process.env.NOTION_API_KEY || !process.env.NOTION_TODO_DATA_SOURCE_ID) {
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            '현재 노션 할일 연동이 비활성화되어 있습니다. (API 키 또는 데이터 소스 ID 누락)'
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === '목록') {
      await interaction.deferReply();

      try {
        const todos = await NotionService.getIncompleteTodos();

        if (todos.length === 0) {
          const emptyEmbed = new EmbedBuilder()
            .setColor(Colors.SUCCESS)
            .setTitle('📝 남은 할 일 목록')
            .setDescription('현재 남은 할 일이 없습니다. 모두 완료하셨군요! 🎉')
            .setFooter({ text: 'Notion 연동' })
            .setTimestamp();

          await interaction.editReply({ embeds: [emptyEmbed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(Colors.INFO)
          .setTitle(`📝 남은 할 일 목록 (총 ${todos.length}건)`)
          .setFooter({ text: 'Notion 연동' })
          .setTimestamp();

        let description = '';
        const maxDisplay = 25;
        const displayedTodos = todos.slice(0, maxDisplay);

        displayedTodos.forEach((todo, index) => {
          const priorityTag = todo.priority ? ` \`[${todo.priority}]\`` : '';
          const statusTag = todo.status ? ` - ${todo.status}` : '';
          description += `${index + 1}. **${todo.title}**${priorityTag}${statusTag}\n`;
        });

        if (todos.length > maxDisplay) {
          description += `\n*외 ${todos.length - maxDisplay}개의 할 일이 더 있습니다.*`;
        }

        embed.setDescription(description);

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('Error in /할일 목록 command:', error);
        await interaction.editReply({
          embeds: [createErrorEmbed('할 일 목록을 불러오는 중 서버 통신 오류가 발생했습니다.')],
        });
      }
    } else if (subcommand === '추가') {
      const title = interaction.options.getString('내용', true);
      const priority = interaction.options.getString('우선순위') || undefined;

      await interaction.deferReply();

      try {
        await NotionService.addTodo(title, priority);

        const embed = new EmbedBuilder()
          .setColor(Colors.SUCCESS)
          .setTitle('✅ 새로운 할 일이 추가되었습니다.')
          .addFields({ name: '내용', value: title, inline: true });

        if (priority) {
          embed.addFields({ name: '우선순위', value: priority, inline: true });
        }

        embed.setFooter({ text: 'Notion 연동' }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('Error in /할일 추가 command:', error);
        await interaction.editReply({
          embeds: [createErrorEmbed('할 일을 추가하는 중 서버 통신 오류가 발생했습니다.')],
        });
      }
    }
  },
};
