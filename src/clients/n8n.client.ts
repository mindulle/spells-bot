import axios from 'axios';
import { logger } from '../utils/logger';

class N8nClient {
  private static instance: N8nClient;
  private healthUrl: string;
  private apiUrl?: string;
  private apiKey?: string;

  private constructor() {
    this.healthUrl = process.env.N8N_HEALTH_WEBHOOK || 'http://localhost:5678/healthz';
    this.apiUrl = process.env.N8N_API_URL;
    this.apiKey = process.env.N8N_API_KEY;
  }

  public static getInstance(): N8nClient {
    if (!N8nClient.instance) {
      N8nClient.instance = new N8nClient();
    }
    return N8nClient.instance;
  }

  public async ping(): Promise<boolean> {
    try {
      const response = await axios.get(this.healthUrl, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      logger.error('n8n ping failed', error);
      return false;
    }
  }

  public async triggerWebhook(webhookUrl: string, data: unknown): Promise<unknown> {
    try {
      const response = await axios.post(webhookUrl, data, { timeout: 10000 });
      return response.data as unknown;
    } catch (error) {
      logger.error('n8n webhook trigger failed', error);
      throw error;
    }
  }

  public async getRecentExecutions(limit: number = 5): Promise<unknown[]> {
    if (!this.apiUrl || !this.apiKey) {
      throw new Error('N8N_API_URL or N8N_API_KEY is not configured.');
    }

    try {
      const response = await axios.get(`${this.apiUrl}/api/v1/executions`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
        params: {
          limit,
        },
        timeout: 10000,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (response.data?.data as unknown[]) || [];
    } catch (error) {
      logger.error('n8n executions fetch failed', error);
      throw error;
    }
  }
}

export const n8nClient = N8nClient.getInstance();
