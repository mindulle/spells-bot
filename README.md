# ✨ Spells Bot (Infra & DevOps Edition)

Sonagi 생태계의 인프라 제어, CDN 관리, 그리고 유틸리티 접근을 위한 통합 Discord 봇입니다.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat&logo=discord&logoColor=white)

## 🎯 주요 기능 (예정)

### 🏗️ 인프라 제어 (`/infra`)

- K3s 클러스터 헬스체크 및 노드/파드 상태 점검
- n8n 웹훅 및 워크플로우 상태 모니터링

### 🌐 CDN 관리 (`/cdn`)

- Cloudflare 캐시 퍼지 (Purge Cache)
- 웹사이트 트래픽 및 CDN 상태 통계 확인

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

- `src/commands/infra/`: 인프라 상태 제어 커맨드
- `src/commands/cdn/`: Cloudflare CDN 관리 커맨드
- `src/commands/gallery/`: Eagle API 연동 검색 커맨드
- `src/services/`: 외부 서비스 API 통합 계층
