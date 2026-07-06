import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { infraCommand } from '../src/commands/infra/index';
import { cdnCommand } from '../src/commands/cdn/index';
import { galleryCommand } from '../src/commands/gallery/index';
import { playCommand } from '../src/commands/playgrounds/index';
import { utilsCommand } from '../src/commands/utils/index';
import { paperclipCommand } from '../src/commands/paperclip/index';
import { radioCommand } from '../src/commands/radio/index';

dotenv.config();

const commands = [
  infraCommand.data.toJSON(),
  cdnCommand.data.toJSON(),
  galleryCommand.data.toJSON(),
  playCommand.data.toJSON(),
  utilsCommand.data.toJSON(),
  paperclipCommand.data.toJSON(),
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

async function deployCommands() {
  try {
    console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

    if (guildId) {
      // Deploy to specific guild (faster for development)
      console.log(`📍 Deploying to guild: ${guildId}`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      console.log('✅ Successfully registered guild commands!');
    } else {
      // Deploy globally (takes up to 1 hour to propagate)
      console.log('🌍 Deploying globally...');
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log('✅ Successfully registered global commands!');
      console.log('⚠️  Note: Global commands may take up to 1 hour to appear.');
    }

    console.log('\n📋 Registered commands:');
    commands.forEach((cmd: any) => {
      console.log(`  - /${cmd.name}: ${cmd.description}`);
    });
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    process.exit(1);
  }
}

deployCommands();
