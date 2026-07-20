# Changelog

## [1.7.0](https://github.com/mindulle/spells-bot/compare/v1.6.1...v1.7.0) (2026-07-18)

### Features

- /도움말 명령어 추가 ([#80](https://github.com/mindulle/spells-bot/issues/80)) ([b3388a3](https://github.com/mindulle/spells-bot/commit/b3388a34da479aa035f85caa44ad5806ae8b6dff))
- **commands:** auto-deploy slash commands to Discord on startup ([0690a3d](https://github.com/mindulle/spells-bot/commit/0690a3deebbf296df1469e7612cdddc47fca4cf7))
- **commands:** auto-deploy slash commands to Discord on startup ([1d236a9](https://github.com/mindulle/spells-bot/commit/1d236a9ea6ff8363568edc78abc87abfd827854b))
- **infra:** add /infra anki-sync subcommand (#CEO-321) ([239bf5b](https://github.com/mindulle/spells-bot/commit/239bf5b2ff66e0c17670510e602eadacea7a9658))
- **infra:** add /infra anki-sync subcommand (CEO-321) ([b01fa6d](https://github.com/mindulle/spells-bot/commit/b01fa6d82e3d33cc2e5865bfced121e3b1b2a372))
- **ledger:** add manual slash command and n8n reaction pipeline ([#68](https://github.com/mindulle/spells-bot/issues/68)) ([436b6c8](https://github.com/mindulle/spells-bot/commit/436b6c876aaff790d06492e788d86737ad96db1b))
- n8n 명령어 및 Notion 할일 기능 추가 ([#78](https://github.com/mindulle/spells-bot/issues/78)) ([14ba485](https://github.com/mindulle/spells-bot/commit/14ba485a0ff85cf83acb3c7fc2a302c0579e3c06))
- **notion:** add schedule slash command (CEO-343) ([#67](https://github.com/mindulle/spells-bot/issues/67)) ([96698fd](https://github.com/mindulle/spells-bot/commit/96698fdc8f4cd8314640b8ecae1642fd20fb9b2a))
- **paperclip:** add approval and issue comment slash commands (CEO-342) ([#65](https://github.com/mindulle/spells-bot/issues/65)) ([847f969](https://github.com/mindulle/spells-bot/commit/847f96964848915972f4ee967313547f96c733cf))
- **paperclip:** add plan review slash commands ([#76](https://github.com/mindulle/spells-bot/issues/76)) ([a56c792](https://github.com/mindulle/spells-bot/commit/a56c7922bf8460e021deabed456fe91cc940fd06))
- **paperclip:** add status filter option to list command ([#71](https://github.com/mindulle/spells-bot/issues/71)) ([0b6e24a](https://github.com/mindulle/spells-bot/commit/0b6e24aa19c25a1c3566c7f80dcc9fb8f4a81972))
- **paperclip:** enhance UX with agent heartbeat and detailed errors ([#77](https://github.com/mindulle/spells-bot/issues/77)) ([df159d6](https://github.com/mindulle/spells-bot/commit/df159d6bb7e2fcfb8fad9fea9303f6ac05f57187))
- **radio:** add pagination to VOD podcast list ([2e94aba](https://github.com/mindulle/spells-bot/commit/2e94abaf7f1050be3a76fbed50e3e384ead725e0))
- **radio:** add playback control buttons to radio and VOD embeds ([785e032](https://github.com/mindulle/spells-bot/commit/785e0324ab8c4c4dcaa56db6512be01a03c57b4e))
- **radio:** add podcast VOD and interactive DJ mode (song insertion) ([d29e742](https://github.com/mindulle/spells-bot/commit/d29e742049527b9be0621c9e8b125dacfb775766))
- **radio:** increase VOD episode limit to 25 ([0c61820](https://github.com/mindulle/spells-bot/commit/0c6182093fac87d0b94b0bc0da768f87dfafda4a))
- **radio:** VOD 목록 갯수 25개로 확장 ([2bc1673](https://github.com/mindulle/spells-bot/commit/2bc16736e8cb80c9b1677f598768bb2a852ebb17))
- 라디오 다시듣기(VOD) 및 신청곡 끼어들기 기능 추가 ([4e6a021](https://github.com/mindulle/spells-bot/commit/4e6a0217588dfcd041c21e4c2c73cc89ea806ecb))
- 모달(Modal) 팝업창을 통한 이슈 작성 UX 개선 ([#84](https://github.com/mindulle/spells-bot/issues/84)) ([845731f](https://github.com/mindulle/spells-bot/commit/845731f1ea6ebe2e046133ab31737dc99d168a24))
- 실시간 관제실 (라이브 대시보드) 구축 ([#83](https://github.com/mindulle/spells-bot/issues/83)) ([fc101b1](https://github.com/mindulle/spells-bot/commit/fc101b11ef3abebef34c92b07d79b39c682ada81))
- 우클릭 메시지 앱 (MS To Do 보내기) 추가 ([#81](https://github.com/mindulle/spells-bot/issues/81)) ([00a6118](https://github.com/mindulle/spells-bot/commit/00a61187e86aa2fcebebb552739ed778fd42e3dc))
- 페이퍼클립 결재 UX 전면 개편 (버튼 + 모달) ([#82](https://github.com/mindulle/spells-bot/issues/82)) ([d707103](https://github.com/mindulle/spells-bot/commit/d707103a9c8aa1e729162c8755972fe8282cd498))
- 페이퍼클립 에이전트 강제 호출(Heartbeat) 기능 추가 ([#73](https://github.com/mindulle/spells-bot/issues/73)) ([4251550](https://github.com/mindulle/spells-bot/commit/42515506ad825f376683932d098ca1f84e492a42))
- 페이퍼클립 이슈 상태(Status) 변경 기능 추가 ([#74](https://github.com/mindulle/spells-bot/issues/74)) ([18ada1e](https://github.com/mindulle/spells-bot/commit/18ada1e30765159b826dbe0e14144fa651d82b81))
- 페이퍼클립 이슈 에이전트 할당 기능 추가 ([#72](https://github.com/mindulle/spells-bot/issues/72)) ([486c82e](https://github.com/mindulle/spells-bot/commit/486c82e7bdfc22c65e8a2bf0934b100abf982e4b))
- 페이퍼클립 특정 이슈 상세 조회 기능 추가 ([#69](https://github.com/mindulle/spells-bot/issues/69)) ([c994e1b](https://github.com/mindulle/spells-bot/commit/c994e1bf2281aa2eacee88113ca152038da53328))

### Bug Fixes

- **docker:** copy pokemon-list.json to dist in production image ([304fc22](https://github.com/mindulle/spells-bot/commit/304fc22fdb68f021f701a3d49950cc435fa0d279))
- **docker:** copy pokemon-list.json to dist in production image (#CEO-321) ([98bb86d](https://github.com/mindulle/spells-bot/commit/98bb86dee2d4a2639506c6e88544578e2df9580d))
- **paperclip:** display issue identifier instead of truncated id ([#70](https://github.com/mindulle/spells-bot/issues/70)) ([420edc4](https://github.com/mindulle/spells-bot/commit/420edc4e5333d9b33de34d5b3cff4bd99adc6bf4))
- **radio:** add missing engine property for AttachmentExtractor stream resolution ([f9c49fe](https://github.com/mindulle/spells-bot/commit/f9c49fedf676ce9883365ad964f4fe1ea3195674))
- **radio:** address PR review by adding optional chaining for track.raw ([5305548](https://github.com/mindulle/spells-bot/commit/530554899433cbd3fc5e9666d49ff9d7fb294926))
- **radio:** fix interaction failed error on resume button by using deferUpdate ([2758a55](https://github.com/mindulle/spells-bot/commit/2758a5585e8f85073f3e078357ec89611ca7db96))
- **radio:** remove control buttons and stop collector when radio is stopped ([a233e27](https://github.com/mindulle/spells-bot/commit/a233e275b04d03f35dae93b5b14eb2d8833da564))
- **radio:** resolve final typescript string union error for CI ([39afe51](https://github.com/mindulle/spells-bot/commit/39afe51bbd13a24428d8a3704ed439892eb87fcc))
- **radio:** resolve interaction timeout and add queue cleanup listener ([#64](https://github.com/mindulle/spells-bot/issues/64)) ([7d00219](https://github.com/mindulle/spells-bot/commit/7d002195c766082ada5820f350981620e4fd7346))
- **radio:** resolve readonly metadata and undefined thumbnail errors for CI ([163c7b1](https://github.com/mindulle/spells-bot/commit/163c7b1a38e74a8ce13429c6fd185a070133bc05))
- **radio:** VOD 재생 시 즉시 튕기는 버그 수정 (engine 속성 누락) ([5dd99cb](https://github.com/mindulle/spells-bot/commit/5dd99cb5575860a5543e1e464dd57a68d6aeacee))
- **radio:** 재생 버튼 상호작용 실패 버그 수정 ([a5b19ac](https://github.com/mindulle/spells-bot/commit/a5b19ac05e454cbeda348011ba3070f62787ff24))
- **utils:** resolve ENOENT crash for pokemon-list.json on startup ([#66](https://github.com/mindulle/spells-bot/issues/66)) ([a06eb94](https://github.com/mindulle/spells-bot/commit/a06eb94ccafd313616694702b1c48b52ddb0d426))
- 디스코드 명령어 중복 등록 버그 방지 (동적 스코프 관리) ([#75](https://github.com/mindulle/spells-bot/issues/75)) ([4e4e49e](https://github.com/mindulle/spells-bot/commit/4e4e49ebd22a06d9fe0dc7c96662245d88f69136))

## [1.6.1](https://github.com/mindulle/spells-bot/compare/v1.6.0...v1.6.1) (2026-07-06)

### Bug Fixes

- **docker:** allow native modules to compile by removing ignore-scripts and optimize multi-stage build ([c9748ba](https://github.com/mindulle/spells-bot/commit/c9748bab04ea75aa7d5b6e3d583490aca8a55fcf))
- **radio:** add -live 1 flag to optimize WebM muxer for live streaming pipe ([eacd279](https://github.com/mindulle/spells-bot/commit/eacd27940854fb24072b2f2959dcdeb7fe89151f))
- **radio:** add -re flag to ffmpeg and upgrade docker base to bookworm ([f630f50](https://github.com/mindulle/spells-bot/commit/f630f50b75b24c95e7f75d430713021621350f22))
- **radio:** add -re flag to ffmpeg and upgrade docker base to bookworm ([1dac8e9](https://github.com/mindulle/spells-bot/commit/1dac8e9173780d8b1fbe8525b5de9b86b5d08f04))
- **radio:** add reconnect_at_eof and reconnect_on_network_error flags based on PR review ([07863e8](https://github.com/mindulle/spells-bot/commit/07863e8e2deb05870b830030993ae3ae5104e24a))
- **radio:** address PR code review feedback ([df47d3d](https://github.com/mindulle/spells-bot/commit/df47d3df0f4f311c3512c24511619adbccbff3c7))
- **radio:** disable selfDeaf and add 2s delay for DAVE E2EE handshake ([c8c29d7](https://github.com/mindulle/spells-bot/commit/c8c29d736e468cdd581cca19a66d7c9aeab3ae2f))
- **radio:** disable selfDeaf and add 2s delay for DAVE E2EE handshake ([73e6b5e](https://github.com/mindulle/spells-bot/commit/73e6b5ea7368acf5113b7b7555e9716069a6631d))
- **radio:** fallback to StreamType.Raw and opusscript ([d36af80](https://github.com/mindulle/spells-bot/commit/d36af8056718d1111aaaadf7644feef8ba034bfc))
- **radio:** fallback to StreamType.Raw and opusscript due to extreme instability of djs voice demuxers ([4c00058](https://github.com/mindulle/spells-bot/commit/4c0005847f27a7b1f2ce40a04daaacab842252ed))
- **radio:** remove -re flag to prevent audio player starvation ([7068beb](https://github.com/mindulle/spells-bot/commit/7068bebfd4c65e14b5bc5bfd3fe57bd1a2cb6d2b))
- **radio:** remove -re flag to prevent player starvation ([7df192c](https://github.com/mindulle/spells-bot/commit/7df192ca7832ef89e7818f1f04047f4e0629a27f))
- **radio:** revert command name from testradio back to radio ([6dc42d0](https://github.com/mindulle/spells-bot/commit/6dc42d0f0f3738a741840ffe2702858c3b02eb54))
- **radio:** set ffmpeg ogg page_duration to 20ms to fix discord voice silence ([0c6916c](https://github.com/mindulle/spells-bot/commit/0c6916c1e280b72161a1a4facb35581ddc3a492a))
- **radio:** set ffmpeg ogg page_duration to 20ms to fix discord voice silence ([3b0df0b](https://github.com/mindulle/spells-bot/commit/3b0df0b70444ec0507c67de775f86eb7579eeedd))
- **radio:** switch docker base to debian and use native discordjs/opus ([1e20416](https://github.com/mindulle/spells-bot/commit/1e204165b02503e53dbc9ddc7efdfcf55dedc558))
- **radio:** switch docker base to debian and use native discordjs/opus for stable streaming ([eff9c9f](https://github.com/mindulle/spells-bot/commit/eff9c9fdeecbf1cd645eb1c853cfde33bfeb9253))
- **radio:** switch from Ogg to WebmOpus to resolve discord.js voice demuxing bugs ([64c0e50](https://github.com/mindulle/spells-bot/commit/64c0e50f6d153043a20f307ef4158e10ae2d6dd0))
- **radio:** switch from Ogg to WebmOpus to resolve discord.js voice demuxing bugs ([fab531a](https://github.com/mindulle/spells-bot/commit/fab531adda6a0426aef3c1804688e5952d179367))
- **radio:** switch to opusscript and raw PCM stream to resolve silence issue ([0af8d0b](https://github.com/mindulle/spells-bot/commit/0af8d0be58781e9958343843fad1148b62a82abf))
- **radio:** switch to opusscript and raw PCM stream to resolve silence issue ([f750d0d](https://github.com/mindulle/spells-bot/commit/f750d0d00e810b761bb5fcb44eebee3f8604889b))
- **radio:** switch to robust s16le chunking to fix discord.js/voice silence issue ([80eb0ae](https://github.com/mindulle/spells-bot/commit/80eb0ae7f5ca7a6487c93d6263bcf9244b50b7b6))
- **radio:** switch to robust s16le chunking to fix silence issue ([0219212](https://github.com/mindulle/spells-bot/commit/0219212fb47997eba1890b54bc947630b109666d))

## [1.6.0](https://github.com/mindulle/spells-bot/compare/v1.5.0...v1.6.0) (2026-07-06)

### Features

- **paperclip:** Support multi-company selection (Mindulle/Life) ([5a1359c](https://github.com/mindulle/spells-bot/commit/5a1359c776172814639ba041f0023b1e3a60b396))
- **playgrounds:** add /play run command using Piston API ([9e20912](https://github.com/mindulle/spells-bot/commit/9e209122951635cb599f69962d6f256b5f5c1a81))
- **playgrounds:** add /play run command using Piston API ([94f1cad](https://github.com/mindulle/spells-bot/commit/94f1caded7d0e7063911f558f4043fdd1e926b17))
- **radio:** add mbc radio streaming voice command ([6c046d4](https://github.com/mindulle/spells-bot/commit/6c046d466b95416ed0dc357d9cbbcf960e4476a6))
- **radio:** add mbc radio streaming voice command ([49e223a](https://github.com/mindulle/spells-bot/commit/49e223ad23bd5d19c997d20f222d7c8ca9d0ee28))
- 페이퍼클립 다중 회사(Multi-Company) 선택 기능 추가 ([31508c8](https://github.com/mindulle/spells-bot/commit/31508c8092884103bfdd1c3ecd99298f007ec549))
- 페이퍼클립 이슈 목록 조회 커맨드 추가 ([2103973](https://github.com/mindulle/spells-bot/commit/2103973cf3cb8681ee07df8d60bd431cfc26d8f9))

### Bug Fixes

- **bot:** add GuildVoiceStates intent to allow joining voice channels ([8bf5958](https://github.com/mindulle/spells-bot/commit/8bf595825b1357a723a69c97aa14301a4bf17971))
- **bot:** add GuildVoiceStates intent to allow joining voice channels ([e8775ce](https://github.com/mindulle/spells-bot/commit/e8775ce866030dd8bed5484acdb879dd4f77f63b))
- **deploy:** register radio slash command to discord ([8976615](https://github.com/mindulle/spells-bot/commit/897661523c8c9ef8359fd412b615a9aaf00a2432))
- **docker:** install ffmpeg in alpine image for voice streaming ([38b14d2](https://github.com/mindulle/spells-bot/commit/38b14d2849deccc99d2f2f1de4c6c96574ad5459))
- **docker:** install ffmpeg in alpine image for voice streaming ([168e862](https://github.com/mindulle/spells-bot/commit/168e86257dc9b3f46bde4bb587a65a63b98edfc2))
- **docker:** optimize image size by moving ffmpeg-static to devDeps and removing native libsodium ([e0c97ea](https://github.com/mindulle/spells-bot/commit/e0c97ea2bc3aacb670430e9adc730240b49147b2))
- **paperclip:** Use correct API endpoint with companyId ([94c026e](https://github.com/mindulle/spells-bot/commit/94c026e6b59ec44a4242c1e2771fa01a56e4e289))
- **playgrounds:** address PR feedback - markdown trim, sanitize backticks, handle 429 rate limit ([3b82d2a](https://github.com/mindulle/spells-bot/commit/3b82d2a2b83a3bbae447422118e44a2a5c544a35))
- **playgrounds:** apply ai pr reviewer suggestions ([673c57e](https://github.com/mindulle/spells-bot/commit/673c57e6e0bf641ff2f0c43c7f8f1e9e8f31421c))
- **playgrounds:** switch piston endpoint to internal k8s service ([561d044](https://github.com/mindulle/spells-bot/commit/561d044b0608b8d9b1870d96a2e6a177be77219c))
- **playgrounds:** switch piston endpoint to internal k8s service ([12af079](https://github.com/mindulle/spells-bot/commit/12af0793fe7779b7cb8958b0d271a2680b290dfa))
- **playgrounds:** use base url for piston endpoint to handle trailing slashes robustly ([2528c4d](https://github.com/mindulle/spells-bot/commit/2528c4d21c90b217e69a9a7c966cd8bf845bf212))
- **radio:** apply ai code review suggestions for ffmpeg robustness and startup delay ([cd735eb](https://github.com/mindulle/spells-bot/commit/cd735eb31609222827a331dc2cdc802f6ef9c260))
- **radio:** manually transcode HLS to OggOpus using spawned ffmpeg ([dfb6777](https://github.com/mindulle/spells-bot/commit/dfb6777db9b8e15d42c378d5cb6e8a8ec7fecd25))
- **radio:** manually transcode HLS to OggOpus using spawned ffmpeg to prevent silence ([9ffbd1c](https://github.com/mindulle/spells-bot/commit/9ffbd1c00246689c952864d35a7ea575eb039255))

## [1.5.0](https://github.com/mindulle/spells-bot/compare/v1.4.0...v1.5.0) (2026-07-05)

### Features

- Add Paperclip issue creation slash command and service ([def7349](https://github.com/mindulle/spells-bot/commit/def734964083c38126b3c2900beaab6f3bdde12a))
- Add script to clear duplicate Discord application commands ([8e28f04](https://github.com/mindulle/spells-bot/commit/8e28f04bfc6c1636c800b219c3c22738e9c18662))
- **discord:** add auto-reaction and n8n webhook routing for web clip channel ([3b79eb0](https://github.com/mindulle/spells-bot/commit/3b79eb0964b4877719da0e9d2e716abfdab25114))
- **discord:** add auto-reaction and n8n webhook routing for web clip channel ([6c80b38](https://github.com/mindulle/spells-bot/commit/6c80b3870839edfa52ed8be82b62af43774baa13))
- 페이퍼클립(Paperclip) 제어 슬래시 커맨드 및 API 연동 추가 ([8261593](https://github.com/mindulle/spells-bot/commit/8261593b4d8354f17abe62651199c9ef9899b098))

### Bug Fixes

- deploy-commands.ts 스크립트에 paperclipCommand 누락된 문제 해결 ([685fbb9](https://github.com/mindulle/spells-bot/commit/685fbb95995a943e32006d49de7677f9218931be))
- Include paperclip command in deploy script ([ac5a5b2](https://github.com/mindulle/spells-bot/commit/ac5a5b2845f19930eb0d8d20421f7be0ba3ba29f))

## [1.4.0](https://github.com/mindulle/spells-bot/compare/v1.3.0...v1.4.0) (2026-07-03)

### Features

- **utils:** add /utils pokemon command for Dexy bot integration ([1a9bcca](https://github.com/mindulle/spells-bot/commit/1a9bcca815ea7e3b28d3710f4982ef00750dd760))
- **utils:** Dexy(포켓도감) 봇 흡수 및 통합 ([c4c9827](https://github.com/mindulle/spells-bot/commit/c4c98271c88a91f5f740950d5ade8d2ac4fdb916))

### Bug Fixes

- **utils:** apply Nuri's feedback (encode query, handle spaces, add 404 test) ([4e6f933](https://github.com/mindulle/spells-bot/commit/4e6f93326f4edd55a8a7e1254813b6c22b9ac376))

## [1.3.0](https://github.com/mindulle/spells-bot/compare/v1.2.0...v1.3.0) (2026-07-03)

### Features

- **utils:** add /utils dog and /utils cat commands ([a3fe64a](https://github.com/mindulle/spells-bot/commit/a3fe64af7389524d19cfe525bd9f462d0527d457))
- **utils:** Dog & Cat 봇 흡수 및 통합 ([2850920](https://github.com/mindulle/spells-bot/commit/285092066912335d63033466c0676f6e2c4b9cda))

### Bug Fixes

- **utils:** add filter parameter to exclude video formats from random.dog API ([4aa4015](https://github.com/mindulle/spells-bot/commit/4aa4015b1948b0a8e073e123e33f424e5205c888))
- **utils:** add missing User-Agent headers to animal and food APIs ([c72abb9](https://github.com/mindulle/spells-bot/commit/c72abb9f23ba4c890431c85d435fb7471589a230))
- **utils:** add User-Agent to wiki api to prevent 403 Forbidden ([8b71635](https://github.com/mindulle/spells-bot/commit/8b7163578e1ff6e01c372b4c6c795d24f94db4c4))
- **utils:** switch dog API provider due to cloudflare 520 outage ([5288f29](https://github.com/mindulle/spells-bot/commit/5288f29a807572ccb9aa96d6e6abf5a1981319d7))
- **utils:** 강아지 사진 API 서버 장애(520)로 인한 Provider 교체 ([a28ed10](https://github.com/mindulle/spells-bot/commit/a28ed1097beedf57917964c8f340d84ccc0b7eb5))
- **utils:** 강아지 사진 API에서 mp4/webm 동영상 응답 제외 ([a98f16f](https://github.com/mindulle/spells-bot/commit/a98f16fb7bab21826f1fca245cea7af0f3ccefcd))
- **utils:** 봇 API 호출 시 520/403 방지용 User-Agent 일괄 추가 ([135d345](https://github.com/mindulle/spells-bot/commit/135d345326f5b58b88bf641ca642957664f97959))
- **utils:** 위키 검색 API 403 에러 수정 ([b85aeb1](https://github.com/mindulle/spells-bot/commit/b85aeb10381b983ea13e57204c267d4254c2af42))

## [1.2.0](https://github.com/mindulle/spells-bot/compare/v1.1.0...v1.2.0) (2026-07-03)

### Features

- **utils:** switch food-bot to Foodish API and add /utils photo (PhotoBox) command ([620754c](https://github.com/mindulle/spells-bot/commit/620754c453b9dff7b3a3d26f08b52c63cb3318cd))
- **utils:** update food and photo bots using public APIs ([3daad83](https://github.com/mindulle/spells-bot/commit/3daad83b113536f6fc636d44dbc3787b41f2eca0))

### Reverts

- AI PR Reviewer 추가 롤백 ([a9a829c](https://github.com/mindulle/spells-bot/commit/a9a829ca2f480b66207387147391fb5dd83f64df))
- remove AI PR Reviewer workflow as per user request ([e2ba6da](https://github.com/mindulle/spells-bot/commit/e2ba6da0e809e6a62e4c6c5d7d9df77ce5d19417))

## [1.1.0](https://github.com/mindulle/spells-bot/compare/v1.0.0...v1.1.0) (2026-07-03)

### Features

- **utils:** add /utils slash command with food and wiki subcommands ([7811589](https://github.com/mindulle/spells-bot/commit/781158918e4eccfec1808154e66f5c9d7701e8bf))
- **utils:** add /utils slash command with food and wiki subcommands ([ebf4318](https://github.com/mindulle/spells-bot/commit/ebf431850748bcee0a0a536af061cbade4a91525))

## 1.0.0 (2026-07-03)

### Features

- **cdn:** implement minio client for cache purging and stats ([2959f0d](https://github.com/mindulle/spells-bot/commit/2959f0d88d44fb230a0d676a313c2fee748eb189))
- **gallery:** implement real Eagle App API communication using axios ([aedbdfc](https://github.com/mindulle/spells-bot/commit/aedbdfcb460782b6e658b45a5ec11a820a5c1175))
- implement Eagle Gallery client ([90231a0](https://github.com/mindulle/spells-bot/commit/90231a0d759b067aa172e4035aab758b8d3ef902))
- implement K3s and n8n clients and harden Dockerfile ([1cdec93](https://github.com/mindulle/spells-bot/commit/1cdec936bdbd747a77c64f9e88cb7a6e93c3693f))
- implement MinIO client ([5f2d5bf](https://github.com/mindulle/spells-bot/commit/5f2d5bf1ded79969dc5be30a7d00cf2791828bcc))
- **infra:** implement K3s and n8n clients & harden Dockerfile ([f4e87c2](https://github.com/mindulle/spells-bot/commit/f4e87c2ff088c0d2758eb9f3ef7307dac3cc7a74))
- **infra:** scaffold 3-tier architecture and implement /infra status command ([1b9e426](https://github.com/mindulle/spells-bot/commit/1b9e426fe3c8bd5a5787b114357f6ed9a6cdddc4))
- integrate Playgrounds sandbox command ([a30bffb](https://github.com/mindulle/spells-bot/commit/a30bffba6cab5c6e81bfb71b00550148d342dbd9))
- **playgrounds:** integrate Sonagi Playgrounds sandbox API via /play command ([a029019](https://github.com/mindulle/spells-bot/commit/a029019890d36389e69386ba22eeddb68e4d4551))
- scaffold cdn and gallery commands ([90fec33](https://github.com/mindulle/spells-bot/commit/90fec3330c50a13edb61f9cd992aec046174628a))
- scaffold CDN and Gallery commands based on 3-Tier architecture ([1687e59](https://github.com/mindulle/spells-bot/commit/1687e59545778c049d316c9fb37c26534128d9d1))
- scaffold infra status command and clients ([25da1cf](https://github.com/mindulle/spells-bot/commit/25da1cf1414fc7a5eabda26cf0c5c083fac5a19d))

### Bug Fixes

- commit lockfile and apply review feedback (eslint-config-prettier) ([7f9ce57](https://github.com/mindulle/spells-bot/commit/7f9ce570491917e4b4479328bdf2f8fa7d0e1876))
- **playgrounds:** add missing playCommand imports, type safety, and axios timeout ([ed13633](https://github.com/mindulle/spells-bot/commit/ed136334dd0a381cbdfb991060032e46f108aee2))
- resolve TypeScript type errors in snippet command ([845e569](https://github.com/mindulle/spells-bot/commit/845e56918c37961219e6631f90c8f34c036365a4))
- setup buildx for docker cache export ([be435be](https://github.com/mindulle/spells-bot/commit/be435be1c2d16807c7662f474f904f21385fb4a3))
