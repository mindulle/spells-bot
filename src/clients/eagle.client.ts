import axios from 'axios';
import { logger } from '../utils/logger';

export interface EagleImage {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

interface EagleItemData {
  id: string;
  name: string;
  tags?: string[];
}

interface EagleApiResponse {
  status: string;
  data: EagleItemData[];
}

class EagleClient {
  private static instance: EagleClient;
  private apiUrl: string;

  private constructor() {
    // Sonagi Eagle Gallery Proxy URL or Local Eagle App URL
    this.apiUrl = process.env.EAGLE_API_URL || 'http://localhost:41595';
  }

  public static getInstance(): EagleClient {
    if (!EagleClient.instance) {
      EagleClient.instance = new EagleClient();
    }
    return EagleClient.instance;
  }

  public async searchImages(query: string): Promise<EagleImage[]> {
    try {
      // Calling Eagle App's local API (or Sonagi proxy equivalent)
      const response = await axios.get<EagleApiResponse>(`${this.apiUrl}/api/item/list`, {
        params: { keyword: query, limit: 10 },
      });

      if (response.data && response.data.status === 'success') {
        const items = response.data.data;

        if (!items || items.length === 0) {
          return [];
        }

        return items.map((item) => ({
          id: item.id,
          name: item.name,
          // Eagle App serves thumbnails via this endpoint
          url: `${this.apiUrl}/api/item/thumbnail?id=${item.id}`,
          tags: item.tags || [],
        }));
      }

      return [];
    } catch (error) {
      logger.error(`Eagle search failed for query: ${query}`, error);

      // Fallback to mock data to prevent bot crash during dev or API outage
      return [
        {
          id: 'mock-1',
          name: `Reference for ${query} (Mock/Offline)`,
          url: 'https://via.placeholder.com/600x400.png?text=Eagle+Offline',
          tags: [query, 'UI', 'Offline-Mock'],
        },
      ];
    }
  }
}

export const eagleClient = EagleClient.getInstance();
