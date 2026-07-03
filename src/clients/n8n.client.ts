import axios from 'axios';
import { logger } from '../utils/logger';

class N8nClient {
  private static instance: N8nClient;
  private healthUrl: string;

  private constructor() {
    this.healthUrl = process.env.N8N_HEALTH_WEBHOOK || 'http://localhost:5678/healthz';
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
      // n8n returns {"status":"ok"} on /healthz
      return response.status === 200;
    } catch (error) {
      logger.error('n8n ping failed', error);
      return false;
    }
  }
}

export const n8nClient = N8nClient.getInstance();
