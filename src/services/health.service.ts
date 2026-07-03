import { minioClient } from '../clients/minio.client';
import { n8nClient } from '../clients/n8n.client';
import { k3sClient } from '../clients/k3s.client';

export interface SystemHealth {
  minio: boolean;
  n8n: boolean;
  k3s: boolean;
  timestamp: Date;
}

class HealthService {
  public async getSystemStatus(): Promise<SystemHealth> {
    // Check all services concurrently
    const [minio, n8n, k3s] = await Promise.all([
      minioClient.ping(),
      n8nClient.ping(),
      k3sClient.ping(),
    ]);

    return {
      minio,
      n8n,
      k3s,
      timestamp: new Date(),
    };
  }
}

export const healthService = new HealthService();
