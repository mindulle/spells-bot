import {
  AutocompleteInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  ContextMenuCommandBuilder,
} from 'discord.js';

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | ContextMenuCommandBuilder;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (interaction: any) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface CommandCategory {
  name: string;
  description: string;
  commands: Command[];
}

export type CommandMap = Map<string, Command>;
