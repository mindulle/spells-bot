# Changelog

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
