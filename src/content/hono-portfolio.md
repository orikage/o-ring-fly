---
title: Hono × Bun で軽量ポートフォリオを作る
date: 2026-01-25
tags: Hono, Bun, TypeScript, Portfolio
---

## なぜ Hono + Bun？

2026年現在、Next.jsは強力だがポートフォリオに対してやすぎる。
**Hono** は超軽量のWebフレームワーク、**Bun** はNode.jsより高速なRuntimeです。
組み合わせると起動がミリ秒単位で、メモリも数十MBで済みます。

![アーキテクチャダイアグラム](/content/resource/img/hono-architecture.png)

## プロジェクト構成

このポートフォリオのディレクトリ構成です。

```
src/
├── components/          # ページコンポーネント
│   ├── layout.tsx       # Three.js + HUD レイアウト
│   ├── home.tsx         # ホームページ
│   ├── content-list.tsx # アーカイブ一覧
│   └── article.tsx      # 記事詳細
├── content/             # Markdownコンテンツ
│   ├── resource/
│   │   └── img/         # 記事に付随する画像リソース
│   ├── proxmox-setup.md
│   ├── hono-portfolio.md
│   └── cloudflare-tunnel.md
├── index.tsx            # エントリポイント・ルーティング
├── content.ts           # Frontmatter + Markdown パーサ
└── style.css            # Tailwind + タクティカルテーマ
```

## 記事リソース（画像）の管理

記事に使う画像は `src/content/resource/img/` に置く。
Markdownから参照する際は以下のパスで書く：

```markdown
![画像キャプション](/content/resource/img/画像ファイル名.png)
```

サーバーは `/content/resource/*` のルートで `src/content/resource/` ディレクトリを静的に配信します。
記事を追加するときに画像も一緒に `resource/img/` に置くだけで完成です。

## Tailwind CSS の導入

`style.css` に `@tailwind` ディレクティブを書き、開発時は以下で監視ビルドを開始：

```bash
bun run build:css
```

CDN経由の場合は HTML の `<head>` に CDN スクリプトタグを追加する方法もあります。

## まとめ

- **記事の追加**: `.md` ファイルを `src/content/` に置くだけ
- **画像の追加**: `src/content/resource/img/` に置き、Markdown で参照
- **デプロイ**: Docker 1コマンドで起動
