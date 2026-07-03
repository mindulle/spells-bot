import { logger } from '../utils/logger';

class N8nClient {
  private static instance: N8nClient;

  private constructor() {}

  public static getInstance(): N8nClient {
    if (!N8nClient.instance) {
      N8nClient.instance = new N8nClient();
    }
    return N8nClient.instance;
  }

  public async ping(): Promise<boolean> {
    try {
      // TODO: Implement actual n8n webhook health check
      return Promise.resolve(true);
    } catch (error) {
      logger.error('n8n ping failed', error);
      return false;
    }
  }
}

export const n8nClient = N8nClient.getInstance();
