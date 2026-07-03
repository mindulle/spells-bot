# Spells Bot - Infra & DevOps Agent Skill

이 문서는 `spells-bot` 저장소에서 작업할 때 AI 에이전트(Opencode 등)가 준수해야 할 가이드라인입니다.

## 1. 프로젝트 정체성

- `spells-bot`은 Sonagi 생태계의 **인프라 관제 및 DevOps 유틸리티 봇**입니다.
- 주요 목적: K3s 상태 확인, n8n 파이프라인 헬스체크, MinIO 기반 CDN 및 스토리지 제어, Eagle Gallery 레퍼런스 조회.

## 2. 디렉토리 구조 및 컨벤션

- **`src/commands/infra/`**: K3s, n8n 등 내부 인프라 상태 제어 및 조회 (`/infra`)
- **`src/commands/cdn/`**: MinIO 스토리지 연동, 버킷 상태 및 파일 관리 (`/cdn`)
- **`src/commands/gallery/`**: Eagle API 연동 디자인/레퍼런스 검색 (`/gallery`)
- **`src/services/`**: 각 도메인별 API 통신 로직 격리 (`minio.service.ts`, `k3s.service.ts`, `eagle.service.ts` 등)

## 3. 코드 컨벤션

- **TypeScript & Discord.js v14**: 모든 명령어는 `SlashCommandBuilder`를 사용합니다.
- **Git Hooks**: `husky`와 `lint-staged`가 구성되어 있습니다. 커밋 시 자동으로 ESLint와 Prettier가 실행됩니다.
- **비동기 처리**: Promise 반환 시 불필요한 `async`를 피하고, Floating Promise가 발생하지 않도록 `void` 또는 `await`를 명시적으로 사용합니다.

## 4. 커맨드 구현 패턴

명령어는 항상 다음 인터페이스를 따릅니다:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/commands';

export const commandName: Command = {
  data: new SlashCommandBuilder().setName('name').setDescription('description'),
  async execute(interaction: ChatInputCommandInteraction) {
    // 로직
  },
};
```

## 5. 아키텍처 및 디자인 패턴 (3-Tier Layer드 구조)

디스코드 봇은 기본적으로 커맨드 패턴으로 동작하지만, 유지보수성을 위해 반드시 아래의 계층형 설계를 따릅니다:

### Tier 1: Presentation Layer (`src/commands/`)

- **역할**: 사용자 입력 처리, Discord Embed UI 생성, 응답 전송.
- **규칙**: 외부 API 통신이나 비즈니스 로직을 이곳에 직접 작성하지 않습니다. 오직 Service 계층의 함수만 호출합니다.

### Tier 2: Business Logic Layer (`src/services/`, Facade 패턴)

- **역할**: 인프라 상태 수집, 데이터 가공 및 비즈니스 로직 판단.
- **규칙**: 커맨드 계층이 내부의 복잡한 통신을 알 필요가 없도록 `HealthService.getSystemStatus()` 처럼 추상화된 메서드(Facade)를 제공합니다.

### Tier 3: Integration Layer (`src/clients/`, Adapter & Singleton 패턴)

- **역할**: MinIO, K3s, n8n 등 외부 시스템과의 실제 통신을 담당.
- **규칙**: 외부 API 스펙 변경에 대비해 어댑터 패턴으로 구현하며, 불필요한 네트워크 연결을 막기 위해 클라이언트 인스턴스는 싱글톤으로 유지합니다.
