import * as Minio from 'minio';
import { logger } from '../utils/logger';

class MinioClientWrapper {
  private static instance: MinioClientWrapper;
  private client: Minio.Client | null = null;
  private defaultBucket: string;

  private constructor() {
    this.defaultBucket = process.env.MINIO_DEFAULT_BUCKET || 'sonagi-bucket';

    const endPoint = process.env.MINIO_ENDPOINT;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;

    if (endPoint && accessKey && secretKey) {
      this.client = new Minio.Client({
        endPoint,
        port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 443,
        useSSL: process.env.MINIO_USE_SSL !== 'false',
        accessKey,
        secretKey,
      });
      logger.info(`MinIO Client initialized for ${endPoint}`);
    } else {
      logger.warn('MinIO configuration missing. Running in mock mode.');
    }
  }

  public static getInstance(): MinioClientWrapper {
    if (!MinioClientWrapper.instance) {
      MinioClientWrapper.instance = new MinioClientWrapper();
    }
    return MinioClientWrapper.instance;
  }

  public async ping(): Promise<boolean> {
    if (!this.client) return false;

    try {
      // Check if the default bucket exists to verify connection
      await this.client.bucketExists(this.defaultBucket);
      return true;
    } catch (error) {
      logger.error('MinIO ping failed', error);
      return false;
    }
  }

  public async purgeCache(target: string): Promise<boolean> {
    if (!this.client) {
      logger.info(`[MOCK] Purging MinIO target: ${target}`);
      return true;
    }

    try {
      // Note: If 'target' is a directory, MinIO requires listing and deleting multiple objects.
      // For simplicity, we assume target is a specific object key.
      await this.client.removeObject(this.defaultBucket, target);
      logger.info(`Purged MinIO object: ${target}`);
      return true;
    } catch (error) {
      logger.error(`MinIO purge failed for ${target}`, error);
      return false;
    }
  }

  public async getStats(): Promise<{ size: string; objects: number }> {
    if (!this.client) {
      return { size: '150.2 GB (Mock)', objects: 45210 };
    }

    return new Promise((resolve) => {
      let totalSize = 0;
      let totalObjects = 0;

      // Stream objects to calculate stats
      // This is a naive implementation; for huge buckets, Prometheus metrics are preferred.
      const stream = this.client!.listObjectsV2(this.defaultBucket, '', true);

      stream.on('data', (obj) => {
        totalObjects++;
        totalSize += obj.size || 0;
      });

      stream.on('end', () => {
        const sizeInGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
        resolve({ size: `${sizeInGB} GB`, objects: totalObjects });
      });

      stream.on('error', (err) => {
        logger.error('Error calculating MinIO stats', err);
        resolve({ size: 'Error', objects: 0 });
      });
    });
  }
}

export const minioClient = MinioClientWrapper.getInstance();
