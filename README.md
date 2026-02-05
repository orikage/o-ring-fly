# O-ring fly Portfolio

**Hono × Bun × Docker** の軽量ポートフォリオ

## Stack

| レイヤー | 技術 |
|---|---|
| Runtime | Bun |
| Framework | Hono |
| UI | Hono/JSX + Tailwind CSS |
| Content | Markdown (Frontmatter) |
| Infrastructure | Docker |
| Network | Cloudflare Tunnel |

## 開発環境

```bash
bun install
bun run dev        # http://localhost:3000
```

## Docker で起動

```bash
docker compose up -d
```

## ディレクトリ構成

```
src/
├── components/    # Layout, HomePage, ArticlePage, ContentListPage
├── content/       # 記事（.md + Frontmatter）
├── index.tsx      # エントリポイント・ルーティング
├── content.ts     # Markdown読み込みユーティリティ
└── style.css      # Tailwind + タクティカルテーマ
public/            # 静的ファイル
Dockerfile         # Bun ベースの軽量イメージ
docker-compose.yml # サーバー起動設定
```
