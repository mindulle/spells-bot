# ✨ Spells Bot (Infra & DevOps Edition)

Sonagi 생태계의 인프라 제어, CDN 관리, 그리고 유틸리티 접근을 위한 통합 Discord 봇입니다.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat&logo=discord&logoColor=white)

## 🎯 주요 기능 (예정)

### 🏗️ 인프라 제어 (`/infra`)

- K3s 클러스터 헬스체크 및 노드/파드 상태 점검
- n8n 웹훅 및 워크플로우 상태 모니터링

### 🌐 CDN 관리 (`/cdn`)

- MinIO 스토리지 상태 및 파일 퍼지
- MinIO 버킷 상태 및 용량 모니터링

### 🎨 갤러리 검색 (`/gallery`)

- Sonagi Eagle Gallery API 연동
- 태그 기반 디자인 레퍼런스 즉시 검색

---

## 🚀 Quick Start

### 1. 설치 및 환경 설정

```bash
git clone https://github.com/mindulle/spells-bot.git
cd spells-bot
npm install
cp .env.example .env
```

### 2. 환경 변수 (`.env`)

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
```

### 3. 명령어 배포 및 실행

```bash
npm run deploy-commands
npm run dev
```

## 🏗️ 프로젝트 구조

```text
spells-bot/
├── src/
│   ├── commands/              # 디스코드 슬래시 커맨드
│   │   ├── infra/            # K3s, n8n 상태 제어
│   │   ├── cdn/              # MinIO CDN 관리
│   │   ├── gallery/          # Eagle Gallery 연동 검색
│   │   ├── design/           # 디자인 관련 기능 (Blur 등)
│   │   └── utils/            # 공통/일반 커맨드
│   ├── services/             # 외부 API 연동 계층 (MinIO, K3s 등)
│   ├── utils/                # 유틸리티 (로거, 임베드 빌더 등)
│   ├── types/                # TypeScript 타입 정의
│   ├── events/               # Discord.js 이벤트 핸들러
│   └── index.ts              # 메인 봇 엔트리포인트
├── .opencode/
│   └── skills/               # AI 에이전트 작업 가이드 (SKILL.md)
├── scripts/
│   └── deploy-commands.ts    # 커맨드 전역 배포 스크립트
└── package.json
```
