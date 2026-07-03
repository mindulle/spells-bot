# Changelog

## [1.4.0](https://github.com/mindulle/spells-bot/compare/v1.3.0...v1.4.0) (2026-07-03)


### Features

* **utils:** add /utils pokemon command for Dexy bot integration ([1a9bcca](https://github.com/mindulle/spells-bot/commit/1a9bcca815ea7e3b28d3710f4982ef00750dd760))
* **utils:** Dexy(포켓도감) 봇 흡수 및 통합 ([c4c9827](https://github.com/mindulle/spells-bot/commit/c4c98271c88a91f5f740950d5ade8d2ac4fdb916))


### Bug Fixes

* **utils:** apply Nuri's feedback (encode query, handle spaces, add 404 test) ([4e6f933](https://github.com/mindulle/spells-bot/commit/4e6f93326f4edd55a8a7e1254813b6c22b9ac376))

## [1.3.0](https://github.com/mindulle/spells-bot/compare/v1.2.0...v1.3.0) (2026-07-03)


### Features

* **utils:** add /utils dog and /utils cat commands ([a3fe64a](https://github.com/mindulle/spells-bot/commit/a3fe64af7389524d19cfe525bd9f462d0527d457))
* **utils:** Dog & Cat 봇 흡수 및 통합 ([2850920](https://github.com/mindulle/spells-bot/commit/285092066912335d63033466c0676f6e2c4b9cda))


### Bug Fixes

* **utils:** add filter parameter to exclude video formats from random.dog API ([4aa4015](https://github.com/mindulle/spells-bot/commit/4aa4015b1948b0a8e073e123e33f424e5205c888))
* **utils:** add missing User-Agent headers to animal and food APIs ([c72abb9](https://github.com/mindulle/spells-bot/commit/c72abb9f23ba4c890431c85d435fb7471589a230))
* **utils:** add User-Agent to wiki api to prevent 403 Forbidden ([8b71635](https://github.com/mindulle/spells-bot/commit/8b7163578e1ff6e01c372b4c6c795d24f94db4c4))
* **utils:** switch dog API provider due to cloudflare 520 outage ([5288f29](https://github.com/mindulle/spells-bot/commit/5288f29a807572ccb9aa96d6e6abf5a1981319d7))
* **utils:** 강아지 사진 API 서버 장애(520)로 인한 Provider 교체 ([a28ed10](https://github.com/mindulle/spells-bot/commit/a28ed1097beedf57917964c8f340d84ccc0b7eb5))
* **utils:** 강아지 사진 API에서 mp4/webm 동영상 응답 제외 ([a98f16f](https://github.com/mindulle/spells-bot/commit/a98f16fb7bab21826f1fca245cea7af0f3ccefcd))
* **utils:** 봇 API 호출 시 520/403 방지용 User-Agent 일괄 추가 ([135d345](https://github.com/mindulle/spells-bot/commit/135d345326f5b58b88bf641ca642957664f97959))
* **utils:** 위키 검색 API 403 에러 수정 ([b85aeb1](https://github.com/mindulle/spells-bot/commit/b85aeb10381b983ea13e57204c267d4254c2af42))

## [1.2.0](https://github.com/mindulle/spells-bot/compare/v1.1.0...v1.2.0) (2026-07-03)


### Features

* **utils:** switch food-bot to Foodish API and add /utils photo (PhotoBox) command ([620754c](https://github.com/mindulle/spells-bot/commit/620754c453b9dff7b3a3d26f08b52c63cb3318cd))
* **utils:** update food and photo bots using public APIs ([3daad83](https://github.com/mindulle/spells-bot/commit/3daad83b113536f6fc636d44dbc3787b41f2eca0))


### Reverts

* AI PR Reviewer 추가 롤백 ([a9a829c](https://github.com/mindulle/spells-bot/commit/a9a829ca2f480b66207387147391fb5dd83f64df))
* remove AI PR Reviewer workflow as per user request ([e2ba6da](https://github.com/mindulle/spells-bot/commit/e2ba6da0e809e6a62e4c6c5d7d9df77ce5d19417))

## [1.1.0](https://github.com/mindulle/spells-bot/compare/v1.0.0...v1.1.0) (2026-07-03)


### Features

* **utils:** add /utils slash command with food and wiki subcommands ([7811589](https://github.com/mindulle/spells-bot/commit/781158918e4eccfec1808154e66f5c9d7701e8bf))
* **utils:** add /utils slash command with food and wiki subcommands ([ebf4318](https://github.com/mindulle/spells-bot/commit/ebf431850748bcee0a0a536af061cbade4a91525))

## 1.0.0 (2026-07-03)


### Features

* **cdn:** implement minio client for cache purging and stats ([2959f0d](https://github.com/mindulle/spells-bot/commit/2959f0d88d44fb230a0d676a313c2fee748eb189))
* **gallery:** implement real Eagle App API communication using axios ([aedbdfc](https://github.com/mindulle/spells-bot/commit/aedbdfcb460782b6e658b45a5ec11a820a5c1175))
* implement Eagle Gallery client ([90231a0](https://github.com/mindulle/spells-bot/commit/90231a0d759b067aa172e4035aab758b8d3ef902))
* implement K3s and n8n clients and harden Dockerfile ([1cdec93](https://github.com/mindulle/spells-bot/commit/1cdec936bdbd747a77c64f9e88cb7a6e93c3693f))
* implement MinIO client ([5f2d5bf](https://github.com/mindulle/spells-bot/commit/5f2d5bf1ded79969dc5be30a7d00cf2791828bcc))
* **infra:** implement K3s and n8n clients & harden Dockerfile ([f4e87c2](https://github.com/mindulle/spells-bot/commit/f4e87c2ff088c0d2758eb9f3ef7307dac3cc7a74))
* **infra:** scaffold 3-tier architecture and implement /infra status command ([1b9e426](https://github.com/mindulle/spells-bot/commit/1b9e426fe3c8bd5a5787b114357f6ed9a6cdddc4))
* integrate Playgrounds sandbox command ([a30bffb](https://github.com/mindulle/spells-bot/commit/a30bffba6cab5c6e81bfb71b00550148d342dbd9))
* **playgrounds:** integrate Sonagi Playgrounds sandbox API via /play command ([a029019](https://github.com/mindulle/spells-bot/commit/a029019890d36389e69386ba22eeddb68e4d4551))
* scaffold cdn and gallery commands ([90fec33](https://github.com/mindulle/spells-bot/commit/90fec3330c50a13edb61f9cd992aec046174628a))
* scaffold CDN and Gallery commands based on 3-Tier architecture ([1687e59](https://github.com/mindulle/spells-bot/commit/1687e59545778c049d316c9fb37c26534128d9d1))
* scaffold infra status command and clients ([25da1cf](https://github.com/mindulle/spells-bot/commit/25da1cf1414fc7a5eabda26cf0c5c083fac5a19d))


### Bug Fixes

* commit lockfile and apply review feedback (eslint-config-prettier) ([7f9ce57](https://github.com/mindulle/spells-bot/commit/7f9ce570491917e4b4479328bdf2f8fa7d0e1876))
* **playgrounds:** add missing playCommand imports, type safety, and axios timeout ([ed13633](https://github.com/mindulle/spells-bot/commit/ed136334dd0a381cbdfb991060032e46f108aee2))
* resolve TypeScript type errors in snippet command ([845e569](https://github.com/mindulle/spells-bot/commit/845e56918c37961219e6631f90c8f34c036365a4))
* setup buildx for docker cache export ([be435be](https://github.com/mindulle/spells-bot/commit/be435be1c2d16807c7662f474f904f21385fb4a3))
