import axios from 'axios';
import { logger } from '../utils/logger';

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
    const apiUrl = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';

    if (!token || !companyId) {
      throw new Error('PAPERCLIP_API_TOKEN or COMPANY_ID is not configured.');
    }

    try {
      // NOTE: 실제 페이퍼클립 API 규격에 맞춰 수정 필요
      const response = await axios.post<PaperclipIssueResponse>(
        `${apiUrl}/companies/${companyId}/issues`,
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
    const apiUrl = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';

    if (!token || !companyId) {
      throw new Error('PAPERCLIP_API_TOKEN or COMPANY_ID is not configured.');
    }

    try {
      // NOTE: 실제 페이퍼클립 API 규격에 맞춰 수정 필요
      const response = await axios.get<PaperclipIssueResponse[]>(
        `${apiUrl}/companies/${companyId}/issues`,
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

  /**
   * 결재 대기 목록을 조회합니다.
   * @param companyId 대상 회사 ID
   * @param status 상태 (기본: pending)
   */
  static async listApprovals(
    companyId: string,
    status: string = 'pending'
  ): Promise<PaperclipIssueResponse[]> {
    const token = process.env.PAPERCLIP_API_TOKEN;
    const apiUrl = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';

    if (!token || !companyId) {
      throw new Error('PAPERCLIP_API_TOKEN or COMPANY_ID is not configured.');
    }

    try {
      const response = await axios.get<PaperclipIssueResponse[]>(
        `${apiUrl}/companies/${companyId}/approvals`,
        {
          params: { status },
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
      logger.error(`Failed to fetch Paperclip approvals. Reason: ${errorMessage}`);
      throw new Error('Paperclip API Error');
    }
  }

  /**
   * 결재를 승인합니다.
   * @param approvalId 결재 ID
   * @param comment 승인 코멘트 (선택사항)
   */
  static async approve(approvalId: string, comment: string = ''): Promise<Record<string, unknown>> {
    const token = process.env.PAPERCLIP_API_TOKEN;
    const apiUrl = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';

    if (!token) {
      throw new Error('PAPERCLIP_API_TOKEN is not configured.');
    }

    try {
      const body: Record<string, string> = {};
      if (comment) body.comment = comment;

      const response = await axios.post<Record<string, unknown>>(
        `${apiUrl}/approvals/${approvalId}/approve`,
        body,
        {
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
      logger.error(`Failed to approve. Reason: ${errorMessage}`);
      throw new Error('Paperclip API Error');
    }
  }

  /**
   * 결재를 거절합니다.
   * @param approvalId 결재 ID
   * @param comment 거절 코멘트 (선택사항이나 권장됨)
   */
  static async reject(approvalId: string, comment: string = ''): Promise<Record<string, unknown>> {
    const token = process.env.PAPERCLIP_API_TOKEN;
    const apiUrl = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';

    if (!token) {
      throw new Error('PAPERCLIP_API_TOKEN is not configured.');
    }

    try {
      const body: Record<string, string> = {};
      if (comment) body.comment = comment;

      const response = await axios.post<Record<string, unknown>>(
        `${apiUrl}/approvals/${approvalId}/reject`,
        body,
        {
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
      logger.error(`Failed to reject. Reason: ${errorMessage}`);
      throw new Error('Paperclip API Error');
    }
  }

  /**
   * 이슈에 코멘트를 추가합니다.
   * @param issueId 이슈 ID
   * @param body 코멘트 내용
   */
  static async commentOnIssue(issueId: string, body: string): Promise<Record<string, unknown>> {
    const token = process.env.PAPERCLIP_API_TOKEN;
    const apiUrl = process.env.PAPERCLIP_API_URL || 'http://localhost:3000/api';

    if (!token) {
      throw new Error('PAPERCLIP_API_TOKEN is not configured.');
    }

    try {
      const response = await axios.post<Record<string, unknown>>(
        `${apiUrl}/issues/${issueId}/comments`,
        { body },
        {
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
      logger.error(`Failed to add issue comment. Reason: ${errorMessage}`);
      throw new Error('Paperclip API Error');
    }
  }
}
