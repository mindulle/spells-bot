/* eslint-disable no-console */
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID as string;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('❌ Missing required environment variables!');
  console.error('Please check your .env file:');
  console.error('- DISCORD_TOKEN');
  console.error('- DISCORD_CLIENT_ID');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

async function clearCommands() {
  try {
    console.log('🗑️  Started clearing application (/) commands...');

    // 1. 특정 길드(서버) 커맨드 전체 삭제
    if (guildId) {
      console.log(`📍 Clearing commands for guild: ${guildId}`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
      console.log('✅ Successfully deleted all guild commands!');
    } else {
      console.log('⚠️ DISCORD_GUILD_ID is not set in .env. Skipping guild commands cleanup.');
    }

    // 2. 글로벌 커맨드 전체 삭제
    console.log('🌍 Clearing global commands...');
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('✅ Successfully deleted all global commands!');

    console.log(
      '\n🎉 모든 명령어가 초기화되었습니다! 이제 "npm run deploy-commands"를 실행하여 명령어를 1개로 깔끔하게 재등록하세요.'
    );
  } catch (error) {
    console.error('❌ Error clearing commands:', error);
    process.exit(1);
  }
}

void clearCommands();
