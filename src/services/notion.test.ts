/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotionService } from './notion';

// We only want to mock the Notion Client, not everything.
// Since getClient() instantiates a new Client, we can mock the module.
const mockCreate = vi.fn();
const mockQuery = vi.fn();

vi.mock('@notionhq/client', () => {
  return {
    Client: class {
      pages = {
        create: mockCreate,
      };
      dataSources = {
        query: mockQuery,
        retrieve: vi.fn(),
      };
    },
    isFullPage: (page: any) => page.object === 'page',
  };
});

describe('NotionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NOTION_API_KEY = 'test-api-key';
    process.env.NOTION_TODO_DATA_SOURCE_ID = 'test-todo-id';
  });

  describe('addTodo', () => {
    it('should successfully add a todo with priority', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'new-page-id' });

      const result = await NotionService.addTodo('Test Task', 'High');

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const callArg = mockCreate.mock.calls[0][0];
      expect(callArg.parent).toEqual({ type: 'data_source_id', data_source_id: 'test-todo-id' });
      expect(callArg.properties['이름'].title[0].text.content).toBe('Test Task');
      expect(callArg.properties['우선순위'].select.name).toBe('High');
      expect(result).toBe('new-page-id');
    });

    it('should retry with English property names if Korean fails', async () => {
      // First call fails with Name error
      mockCreate.mockRejectedValueOnce(new Error('Property `Name` does not exist'));
      // Second call succeeds
      mockCreate.mockResolvedValueOnce({ id: 'new-page-id-en' });

      const result = await NotionService.addTodo('Test Task EN', 'Low');

      expect(mockCreate).toHaveBeenCalledTimes(2);
      const secondCallArg = mockCreate.mock.calls[1][0];
      expect(secondCallArg.properties['Name'].title[0].text.content).toBe('Test Task EN');
      expect(secondCallArg.properties['Priority'].select.name).toBe('Low');
      expect(result).toBe('new-page-id-en');
    });
  });

  describe('getIncompleteTodos', () => {
    it('should return mapped todos excluding Done status', async () => {
      mockQuery.mockResolvedValueOnce({
        results: [
          {
            object: 'page',
            id: 'page-1',
            properties: {
              Name: { type: 'title', title: [{ plain_text: 'Task 1' }] },
              Status: { type: 'status', status: { name: 'To-do' } },
              Priority: { type: 'select', select: { name: 'High' } },
            },
          },
          {
            object: 'page',
            id: 'page-2',
            properties: {
              이름: { type: 'title', title: [{ plain_text: 'Task 2 (Korean props)' }] },
              상태: { type: 'status', status: { name: 'In Progress' } },
              우선순위: { type: 'select', select: { name: 'Medium' } },
            },
          },
          {
            object: 'page',
            id: 'page-3',
            properties: {
              Name: { type: 'title', title: [{ plain_text: 'Task 3 Done' }] },
              Status: { type: 'status', status: { name: 'Done' } },
            },
          },
        ],
      });

      const todos = await NotionService.getIncompleteTodos();

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(todos).toHaveLength(2);

      expect(todos[0]).toEqual({
        id: 'page-1',
        title: 'Task 1',
        status: 'To-do',
        priority: 'High',
      });

      expect(todos[1]).toEqual({
        id: 'page-2',
        title: 'Task 2 (Korean props)',
        status: 'In Progress',
        priority: 'Medium',
      });
    });
  });
});
