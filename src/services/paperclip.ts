import axios from 'axios';
import { logger } from '../utils/logger';

// TODO: 환경 변수 세팅 필요 (.env 파일에 PAPERCLIP_API_URL, PAPERCLIP_API_TOKEN 추가)
const PAPERCLIP_API_URL = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';

export interface PaperclipIssueResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  [key: string]: unknown;
}

export class PaperclipService {
  /**
   * 새로운 이슈를 생성합니다.
   * @param companyId 대상 회사 ID
   * @param title 이슈 제목
   * @param description 이슈 상세 내용
   */
  static async createIssue(
    companyId: string,
    title: string,
    description: string
  ): Promise<PaperclipIssueResponse> {
    const token = process.env.PAPERCLIP_API_TOKEN;
    if (!token || !companyId) {
      throw new Error('PAPERCLIP_API_TOKEN or COMPANY_ID is not configured.');
    }

    try {
      // NOTE: 실제 페이퍼클립 API 규격에 맞춰 수정 필요
      const response = await axios.post<PaperclipIssueResponse>(
        `${PAPERCLIP_API_URL}/companies/${companyId}/issues`,
        {
          title,
          description,
          status: 'backlog', // 기본으로 백로그 상태 부여
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      // Axios 에러 로깅 시 헤더(Authorization) 노출 방지 처리
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      logger.error(`Failed to create Paperclip issue. Reason: ${errorMessage}`);
      throw new Error('Paperclip API Error');
    }
  }

  /**
   * 이슈 리스트를 조회합니다.
   * @param companyId 대상 회사 ID
   * @param limit 가져올 이슈 개수 (기본 10개)
   */
  static async listIssues(
    companyId: string,
    limit: number = 10
  ): Promise<PaperclipIssueResponse[]> {
    const token = process.env.PAPERCLIP_API_TOKEN;
    if (!token || !companyId) {
      throw new Error('PAPERCLIP_API_TOKEN or COMPANY_ID is not configured.');
    }

    try {
      // NOTE: 실제 페이퍼클립 API 규격에 맞춰 수정 필요
      const response = await axios.get<PaperclipIssueResponse[]>(
        `${PAPERCLIP_API_URL}/companies/${companyId}/issues`,
        {
          params: { limit },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      logger.error(`Failed to fetch Paperclip issues. Reason: ${errorMessage}`);
      throw new Error('Paperclip API Error');
    }
  }
}
