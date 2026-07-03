import { logger } from '../utils/logger';

export interface EagleImage {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

class EagleClient {
  private static instance: EagleClient;

  private constructor() {}

  public static getInstance(): EagleClient {
    if (!EagleClient.instance) {
      EagleClient.instance = new EagleClient();
    }
    return EagleClient.instance;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async searchImages(query: string): Promise<EagleImage[]> {
    try {
      // TODO: Implement actual Eagle API search
      logger.info(`Mock searching Eagle Gallery for: ${query}`);
      return [
        {
          id: 'mock-1',
          name: `Reference for ${query}`,
          url: 'https://via.placeholder.com/600x400.png?text=Eagle+Mock+Image',
          tags: [query, 'UI', 'Reference'],
        },
      ];
    } catch (error) {
      logger.error(`Eagle search failed for query: ${query}`, error);
      return [];
    }
  }
}

export const eagleClient = EagleClient.getInstance();
