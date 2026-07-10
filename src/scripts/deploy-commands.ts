/* eslint-disable no-console */
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { infraCommand } from '../commands/infra/index';
import { cdnCommand } from '../commands/cdn/index';
import { galleryCommand } from '../commands/gallery/index';
import { playCommand } from '../commands/playgrounds/index';
import { utilsCommand } from '../commands/utils/index';
import { paperclipCommand } from '../commands/paperclip/index';
import { paperclipApprovalCommand } from '../commands/paperclip/approval';
import { paperclipAgentCommand } from '../commands/paperclip/agent';
import { paperclipPlanCommand } from '../commands/paperclip/plan';
import { scheduleCommand } from '../commands/notion/index';
import { ledgerCommand } from '../commands/notion/ledger';
import { radioCommand } from '../commands/radio/index';

dotenv.config();

const commands = [
  infraCommand.data.toJSON(),
  cdnCommand.data.toJSON(),
  galleryCommand.data.toJSON(),
  playCommand.data.toJSON(),
  utilsCommand.data.toJSON(),
  paperclipCommand.data.toJSON(),
  paperclipApprovalCommand.data.toJSON(),
  paperclipAgentCommand.data.toJSON(),
  paperclipPlanCommand.data.toJSON(),
  scheduleCommand.data.toJSON(),
  ledgerCommand.data.toJSON(),
  radioCommand.data.toJSON(),
];

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

export async function deployCommands(guildIds?: string[]) {
  try {
    console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

    // 1. 항상 글로벌 커맨드를 초기화하여 중복(스코프 충돌) 방지
    try {
      console.log('🧹 Clearing global commands to prevent duplication...');
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
    } catch (e) {
      console.error('⚠️ Failed to clear global commands:', e);
    }

    // 2. 길드별로 커맨드 등록 (즉시 반영됨)
    const targetGuilds = guildIds && guildIds.length > 0 ? guildIds : guildId ? [guildId] : [];

    if (targetGuilds.length > 0) {
      for (const id of targetGuilds) {
        console.log(`📍 Deploying to guild: ${id}`);
        await rest.put(Routes.applicationGuildCommands(clientId, id), {
          body: commands,
        });
      }
      console.log(`✅ Successfully registered commands to ${targetGuilds.length} guild(s)!`);
    } else {
      console.log('⚠️ No guild IDs provided and DISCORD_GUILD_ID is not set.');
      console.log('⚠️ Commands are cleared globally but not registered anywhere.');
      console.log('⚠️ Please set DISCORD_GUILD_ID or pass guild IDs to deploy.');
    }

    console.log('\n📋 Registered commands:');
    commands.forEach((cmd: { name: string; description: string }) => {
      console.log(`  - /${cmd.name}: ${cmd.description}`);
    });
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    throw error;
  }
}

if (require.main === module) {
  deployCommands().catch((error) => {
    console.error('❌ CLI deployment failed:', error);
    process.exit(1);
  });
}
