import axios from 'axios';
import { logger } from '../utils/logger';

// TODO: 환경 변수 세팅 필요 (.env 파일에 PAPERCLIP_API_URL, PAPERCLIP_API_TOKEN 추가)
const PAPERCLIP_API_URL = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';
const PAPERCLIP_API_TOKEN = process.env.PAPERCLIP_API_TOKEN || '';

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
   * @param title 이슈 제목
   * @param description 이슈 상세 내용
   */
  static async createIssue(title: string, description: string): Promise<PaperclipIssueResponse> {
    try {
      // NOTE: 실제 페이퍼클립 API 규격에 맞춰 수정 필요
      const response = await axios.post<PaperclipIssueResponse>(
        `${PAPERCLIP_API_URL}/issues`,
        {
          title,
          description,
          status: 'backlog', // 기본으로 백로그 상태 부여
        },
        {
          headers: {
            Authorization: `Bearer ${PAPERCLIP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to create Paperclip issue:', error);
      throw error;
    }
  }

  // TODO: 이슈 리스트 조회 로직 (listIssues), 상태 업데이트 로직 추가
}
