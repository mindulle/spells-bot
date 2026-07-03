import { logger } from '../utils/logger';

class K3sClient {
  private static instance: K3sClient;

  private constructor() {}

  public static getInstance(): K3sClient {
    if (!K3sClient.instance) {
      K3sClient.instance = new K3sClient();
    }
    return K3sClient.instance;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async ping(): Promise<boolean> {
    try {
      // TODO: Implement actual K3s API health check

      return true;
    } catch (error) {
      logger.error('K3s ping failed', error);
      return false;
    }
  }
}

export const k3sClient = K3sClient.getInstance();
