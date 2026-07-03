import axios from 'axios';
import * as https from 'https';
import { logger } from '../utils/logger';

class K3sClient {
  private static instance: K3sClient;
  private apiUrl: string;
  private httpsAgent: https.Agent | undefined;

  private constructor() {
    // Usually https://127.0.0.1:6443 or internal cluster IP
    this.apiUrl = process.env.K3S_API_URL || 'https://kubernetes.default.svc';

    // SSL Verification is configurable. Defaults to true (secure)
    const rejectUnauthorized = process.env.K3S_REJECT_UNAUTHORIZED !== 'false';

    if (!rejectUnauthorized) {
      logger.warn(
        'K3sClient: Strict SSL verification is disabled. Do not use this in production unless necessary.'
      );
    }

    this.httpsAgent = new https.Agent({ rejectUnauthorized });
  }

  public static getInstance(): K3sClient {
    if (!K3sClient.instance) {
      K3sClient.instance = new K3sClient();
    }
    return K3sClient.instance;
  }

  public async ping(): Promise<boolean> {
    try {
      // Standard Kubernetes health check endpoint
      const response = await axios.get(`${this.apiUrl}/livez`, {
        httpsAgent: this.httpsAgent,
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      logger.error('K3s ping failed', error);
      return false;
    }
  }
}

export const k3sClient = K3sClient.getInstance();
