import { Client, isFullPage } from '@notionhq/client';
import { logger } from '../utils/logger';

export interface ScheduleItem {
  id: string;
  title: string;
  date: string | null;
  category: string | null;
  location: string | null;
  isDone: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
}

export class NotionService {
  private static getClient(): Client {
    const token = process.env.NOTION_API_KEY;
    if (!token) {
      throw new Error('NOTION_API_KEY is not configured.');
    }
    return new Client({ auth: token });
  }

  private static getDataSourceId(): string {
    const dataSourceId = process.env.NOTION_SCHEDULER_DATA_SOURCE_ID;
    if (!dataSourceId) {
      throw new Error('NOTION_SCHEDULER_DATA_SOURCE_ID is not configured.');
    }
    return dataSourceId;
  }

  private static getTodoDataSourceId(): string {
    const dataSourceId = process.env.NOTION_TODO_DATA_SOURCE_ID;
    if (!dataSourceId) {
      throw new Error('NOTION_TODO_DATA_SOURCE_ID is not configured.');
    }
    return dataSourceId;
  }

  private static getLedgerDataSourceId(): string {
    const dataSourceId = process.env.NOTION_LEDGER_DATA_SOURCE_ID;
    if (!dataSourceId) {
      throw new Error('NOTION_LEDGER_DATA_SOURCE_ID is not configured.');
    }
    return dataSourceId;
  }

  /**
   * 가계부(Ledger) DB의 수입/지출 계좌 목록을 조회합니다.
   * Autocomplete에 활용하기 위한 캐싱 용도입니다.
   */
  static async getLedgerAccounts(): Promise<{
    income: { name: string; id: string }[];
    expense: { name: string; id: string }[];
  }> {
    const notion = this.getClient();
    const dataSourceId = this.getLedgerDataSourceId();

    try {
      const response = await notion.dataSources.retrieve({
        data_source_id: dataSourceId,
      });

      const props = response.properties;

      // 사용자 오타 대응: 'Aaccount (Income)', 'Account (Expense)' 등
      const incomeProp = props['Aaccount (Income)'] || props['Account (Income)'];
      const expenseProp = props['Account (Expense)'] || props['Acoount (Expense)'];

      const incomeOptions = incomeProp?.type === 'select' ? incomeProp.select.options : [];
      const expenseOptions = expenseProp?.type === 'select' ? expenseProp.select.options : [];

      return {
        income: incomeOptions.map((opt) => ({ name: opt.name, id: opt.id })),
        expense: expenseOptions.map((opt) => ({ name: opt.name, id: opt.id })),
      };
    } catch (error) {
      logger.error('Failed to fetch Ledger accounts from Notion', error);
      return { income: [], expense: [] };
    }
  }

  /**
   * 가계부(Ledger)에 새로운 지출/수입 내역을 추가합니다.
   */
  static async addLedgerEntry(data: {
    name: string;
    price: number;
    type: 'Income' | 'Expense';
    domain: '개인' | '비즈니스';
    currency: 'WON' | 'USD' | 'AUD' | 'None';
    accountId?: string;
  }): Promise<string> {
    const notion = this.getClient();
    const dataSourceId = this.getLedgerDataSourceId();

    const today = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const todayKst = new Date(today.getTime() + kstOffset);
    const dateString = todayKst.toISOString().split('T')[0];

    const properties: Record<string, unknown> = {
      Name: {
        title: [
          {
            text: {
              content: data.name,
            },
          },
        ],
      },
      Price: {
        number: data.price,
      },
      Type: {
        select: {
          name: data.type,
        },
      },
      Domain: {
        select: {
          name: data.domain,
        },
      },
      Currency: {
        select: {
          name: data.currency,
        },
      },
      Date: {
        date: {
          start: dateString,
        },
      },
      Done: {
        checkbox: true, // 수동 입력이나 리액션으로 승인된 건이므로 완료 처리
      },
    };

    if (data.accountId) {
      if (data.type === 'Income') {
        // 기존 오타 대응
        properties['Aaccount (Income)'] = { select: { id: data.accountId } };
      } else {
        properties['Account (Expense)'] = { select: { id: data.accountId } };
      }
    }

    try {
      const response = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        properties: properties as any, // eslint-disable-line
      });

      return response.id;
    } catch (error) {
      logger.error('Failed to create ledger entry in Notion', error);
      throw new Error('Notion API Error');
    }
  }

  /**
   * 오늘 날짜의 일정을 모두 가져옵니다.
   */
  static async getTodaySchedules(): Promise<ScheduleItem[]> {
    const notion = this.getClient();
    const dataSourceId = this.getDataSourceId();

    const today = new Date();
    // KST 기준으로 오늘 날짜 YYYY-MM-DD 구하기
    const kstOffset = 9 * 60 * 60 * 1000;
    const todayKst = new Date(today.getTime() + kstOffset);
    const todayString = todayKst.toISOString().split('T')[0];

    try {
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        filter: {
          property: 'Date',
          date: {
            equals: todayString,
          },
        },
        sorts: [
          {
            property: 'Date',
            direction: 'ascending',
          },
        ],
      });

      return response.results.filter(isFullPage).map((page) => {
        const props = page.properties;

        let title = '제목 없음';
        if (props['이름']?.type === 'title' && props['이름'].title.length > 0) {
          title = props['이름'].title[0].plain_text;
        }

        let date = null;
        if (props['Date']?.type === 'date' && props['Date'].date) {
          date = props['Date'].date.start;
        }

        let category = null;
        if (props['카테고리']?.type === 'select' && props['카테고리'].select) {
          category = props['카테고리'].select.name;
        }

        let location = null;
        if (props['Location']?.type === 'rich_text' && props['Location'].rich_text.length > 0) {
          location = props['Location'].rich_text[0].plain_text;
        }

        let isDone = false;
        if (props['Done']?.type === 'checkbox') {
          isDone = props['Done'].checkbox;
        }

        return {
          id: page.id,
          title,
          date,
          category,
          location,
          isDone,
        };
      });
    } catch (error) {
      logger.error('Failed to fetch today schedules from Notion', error);
      throw new Error('Notion API Error');
    }
  }

  /**
   * 새로운 일정을 추가합니다.
   * @param title 일정 제목
   * @param date 일정 날짜 (YYYY-MM-DD 형식)
   * @param category 카테고리 (옵션)
   * @param location 장소 (옵션)
   */
  static async addSchedule(
    title: string,
    date: string,
    category?: string,
    location?: string
  ): Promise<string> {
    const notion = this.getClient();
    const dataSourceId = this.getDataSourceId();

    const properties: Record<string, unknown> = {
      이름: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Date: {
        date: {
          start: date,
        },
      },
    };

    if (category) {
      properties['카테고리'] = {
        select: {
          name: category,
        },
      };
    }

    if (location) {
      properties['Location'] = {
        rich_text: [
          {
            text: {
              content: location,
            },
          },
        ],
      };
    }

    try {
      const response = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        properties: properties as any, // eslint-disable-line
      });

      return response.id;
    } catch (error) {
      logger.error('Failed to create schedule in Notion', error);
      throw new Error('Notion API Error');
    }
  }

  /**
   * 할 일(Todo) 목록을 가져옵니다. (상태가 완료되지 않은 항목들)
   */
  static async getIncompleteTodos(): Promise<TodoItem[]> {
    const notion = this.getClient();
    const dataSourceId = this.getTodoDataSourceId();

    try {
      // NOTE: Notion API filter doesn't support 'does_not_equal' for Status sometimes,
      // but let's just query all and filter locally to be safe, or use simple filter
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
      });

      return response.results
        .filter(isFullPage)
        .map((page) => {
          const props = page.properties;
          let title = '제목 없음';
          if (props['Name']?.type === 'title' && props['Name'].title.length > 0) {
            title = props['Name'].title[0].plain_text;
          } else if (props['이름']?.type === 'title' && props['이름'].title.length > 0) {
            title = props['이름'].title[0].plain_text;
          }

          let status = null;
          if (props['Status']?.type === 'status' && props['Status'].status) {
            status = props['Status'].status.name;
          } else if (props['상태']?.type === 'status' && props['상태'].status) {
            status = props['상태'].status.name;
          } else if (props['상태']?.type === 'select' && props['상태'].select) {
            status = props['상태'].select.name;
          }

          let priority = null;
          if (props['Priority']?.type === 'select' && props['Priority'].select) {
            priority = props['Priority'].select.name;
          } else if (props['우선순위']?.type === 'select' && props['우선순위'].select) {
            priority = props['우선순위'].select.name;
          }

          return { id: page.id, title, status, priority };
        })
        .filter((todo) => todo.status !== 'Done' && todo.status !== '완료');
    } catch (error) {
      logger.error('Failed to fetch todos from Notion', error);
      throw new Error('Notion API Error');
    }
  }

  /**
   * 할 일(Todo)을 추가합니다.
   */
  static async addTodo(title: string, priority?: string): Promise<string> {
    const notion = this.getClient();
    const dataSourceId = this.getTodoDataSourceId();

    let properties: Record<string, unknown> = {
      // 일반적으로 이름 프로퍼티는 'Name' 또는 '이름'입니다. '이름'으로 우선 시도합니다.
      이름: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    };

    if (priority) {
      properties['우선순위'] = {
        select: {
          name: priority,
        },
      };
    }

    try {
      const response = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        properties: properties as any, // eslint-disable-line
      });

      return response.id;
    } catch (error: unknown) {
      logger.warn('Failed to create todo with Korean properties, retrying with English...', error);
      // 영문 Name 프로퍼티일 경우에 대한 재시도
      properties = {
        Name: properties['이름'],
      };
      if (priority) {
        properties['Priority'] = {
          select: {
            name: priority,
          },
        };
      }

      try {
        const fallbackResponse = await notion.pages.create({
          parent: { type: 'data_source_id', data_source_id: dataSourceId },
          properties: properties as any, // eslint-disable-line
        });
        return fallbackResponse.id;
      } catch (e2) {
        logger.error('Failed to create todo in Notion (fallback also failed)', e2);
        throw new Error('Notion API Error');
      }
    }
  }
}
