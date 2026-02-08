# O-ring fly Portfolio

Arknights Endfield のタクティカルUI に触発されたポートフォリオサイト。
Three.js による3D背景と、ミニマリスト設計のコンテンツ表示を組み合わせた構成です。

## スタック

| カテゴリ | 技術 |
|----------|------|
| Runtime | [Bun](https://bun.sh/) |
| Framework | [Hono](https://honojs.dev/) |
| UI | Hono JSX + Tailwind CSS |
| 3Dグラフィクス | [Three.js](https://threejs.org/) v0.160.0 |
| コンテンツ | Markdown (Frontmatter) |
| デプロイ | Docker (Proxmox / LXC) + Cloudflare Tunnel |

## プロジェクト構成

```
o-ring-fly/
├── src/
│   ├── components/
│   │   ├── layout.tsx          # ページレイアウト（Three.js, HUD, Nav）
│   │   ├── home.tsx            # ホームページ
│   │   ├── content-list.tsx    # アーカイブ一覧ページ
│   │   └── article.tsx         # 記事詳細ページ
│   ├── content/
│   │   ├── resource/
│   │   │   └── img/            # 記事リソース（画像など）
│   │   ├── proxmox-setup.md    # サンプル記事
│   │   ├── hono-portfolio.md
│   │   └── cloudflare-tunnel.md
│   ├── index.tsx               # エントリポイント・ルーティング
│   ├── content.ts              # Markdown + Frontmatter パーサ
│   └── style.css               # Tailwind + タクティカルテーマ
├── public/                     # 静的ファイル（CSS ビルド出力など）
├── Dockerfile                  # Bun 軽量イメージ (2-stage)
├── docker-compose.yml          # サーバー起動設定
└── package.json
```

## 記事とリソースの追加方法

### 記事の追加

`src/content/` に `.md` ファイルを追加するだけです。Frontmatter で メタデータを定義します：

```markdown
---
title: 記事タイトル
date: 2026-02-01
tags: タグ1, タグ2
---

記事本文（Markdown）
```

### 画像リソースの追加

記事に付随する画像は `src/content/resource/img/` に配置し、Markdown で以下のように参照します：

```markdown
![画像の説明](/content/resource/img/画像ファイル名.png)
```

サーバーは `/content/resource/*` パスで `src/content/resource/` ディレクトリを静的に配信します。

## 開発・起動

```bash
# 依存関係インストール
bun install

# ローカル開発サーバー
bun run dev   # → http://localhost:3000

# Tailwind CSS ビルド（別ターミナルで）
bun run build:css
```

## Docker 起動

```bash
docker compose up -d
```

## バージョン履歴

| バージョン | スタック | ポイント |
|------------|----------|----------|
| v6.0 (現在) | Hono + Bun + Docker | サーバーサイドルーティング、Markdown記事管理 |
| v5.0 | 静的 HTML + Three.js | GitHub Pages デプロイ |
| v4.0 | Canvas 2D | `index_embedded.html` |
