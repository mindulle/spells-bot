import axios from 'axios';
import * as https from 'https';
import { logger } from '../utils/logger';

class K3sClient {
  private static instance: K3sClient;
  private apiUrl: string;
  private httpsAgent: https.Agent;

  private constructor() {
    // Usually https://127.0.0.1:6443 or internal cluster IP
    this.apiUrl = process.env.K3S_API_URL || 'https://kubernetes.default.svc';

    // Disable strict SSL verification for self-signed K3s certificates
    this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
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
      logger.error('K3s ping failed (API server unreachable)', error);
      return false;
    }
  }
}

export const k3sClient = K3sClient.getInstance();
