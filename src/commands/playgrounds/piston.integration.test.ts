import { describe, it, expect, vi } from 'vitest';
import { playCommand } from './index';
import { ChatInputCommandInteraction } from 'discord.js';

describe('Piston Engine Integration Test', () => {
  it('should execute python code using the real Piston API', async () => {
    // Mock Interaction
    const mockInteraction = {
      options: {
        getSubcommand: () => 'run',
        getString: (name: string) => {
          if (name === 'language') return 'python';
          if (name === 'code') return 'print("Integration Test Pass!")';
          return null;
        },
      },
      deferReply: vi.fn().mockResolvedValue(undefined),
      editReply: vi.fn().mockResolvedValue(undefined),
      reply: vi.fn().mockResolvedValue(undefined),
    } as unknown as ChatInputCommandInteraction;

    // Set Environment Variable to point to localhost (mapped from docker service in CI)
    process.env.PISTON_API_URL = 'http://localhost:2000';

    // Execute the command
    await playCommand.execute(mockInteraction);

    // Verify interaction.deferReply was called
    const deferMock = mockInteraction.deferReply as ReturnType<typeof vi.fn>;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(deferMock).toHaveBeenCalled();

    // Verify interaction.editReply was called with Embed containing the result
    const editMock = mockInteraction.editReply as ReturnType<typeof vi.fn>;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(editMock).toHaveBeenCalled();
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const editReplyCall = editMock.mock.calls[0][0];
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(editReplyCall.embeds).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(editReplyCall.embeds.length).toBe(1);
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const embed = editReplyCall.embeds[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(embed.data.title).toContain('python');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(embed.data.description).toContain('Integration Test Pass!');
  }, 15000); // 15 seconds timeout in case Piston API takes time
});

