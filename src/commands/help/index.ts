import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/commands';
import { Colors } from '../../utils/embed-builder';

export const helpCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('도움말')
    .setDescription('봇에서 사용할 수 있는 모든 명령어 목록과 사용법을 보여줍니다.'),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(Colors.INFO)
      .setTitle('🪄 Spells Bot 명령어 가이드')
      .setDescription('현재 봇에서 사용할 수 있는 명령어 목록입니다. 카테고리별로 확인해 보세요!')
      .setThumbnail(interaction.client.user?.displayAvatarURL() || null)
      .addFields(
        {
          name: '🚀 생산성 & 업무 (Notion / MS To Do)',
          value:
            '`/일정` - 노션에 오늘 일정 조회 및 새로운 일정을 추가합니다.\n' +
            '`/지출` - 노션 가계부에 수입/지출 내역을 기록합니다.\n' +
            '`/할일 추가` - MS To Do에 새로운 할 일을 등록합니다. (n8n 연동)',
        },
        {
          name: '🤖 AI 협업 (Paperclip)',
          value:
            '`/이슈` - AI 에이전트에게 할당할 이슈를 관리합니다.\n' +
            '`/결재` - 에이전트의 승인 요청을 확인하고 처리합니다.\n' +
            '`/에이전트` - 페이퍼클립 에이전트 목록과 상태를 봅니다.\n' +
            '`/계획` - AI가 제안한 이슈 처리 계획을 확인합니다.',
        },
        {
          name: '⚙️ 인프라 & 시스템 제어 (DevOps)',
          value:
            '`/infra` - Sonagi 인프라 상태(K3s 등)를 확인하고 관리합니다.\n' +
            '`/cdn` - MinIO 스토리지 버킷 및 로컬 CDN을 제어합니다.\n' +
            '`/n8n` - n8n 서버 헬스체크 및 워크플로우 기록/실행을 관리합니다.',
        },
        {
          name: '🧰 유틸리티 & 미디어',
          value:
            '`/utils` - 위키 검색, 포켓몬 검색, 무작위 사진(고양이, 강아지, 풍경 등) 기능 모음입니다.\n' +
            '`/gallery` - Eagle 갤러리의 에셋을 검색하고 가져옵니다.\n' +
            '`/play` - Sonagi Playgrounds 플랫폼과 연동합니다.\n' +
            '`/radio` - MBC 라디오 및 팟캐스트를 음성 채널에서 재생합니다.',
        }
      )
      .setFooter({
        text: 'Spells Bot v1.6.1 | 슬래시(/)를 입력해 자동완성되는 세부 옵션들을 확인해보세요!',
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
