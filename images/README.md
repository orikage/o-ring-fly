# images subdomain — Arknights風タクティカルギャラリーサイト

`images.yourdomain.com` として独立したフォトギャラリーサイト。写真とイラストを同じ場所に並べて鑑賞・管理できます。

## スタック

| カテゴリ | 技術 |
|----------|------|
| Runtime | [Bun](https://bun.sh/) |
| Framework | [Hono](https://honojs.dev/) |
| UI | Hono JSX + Tailwind CSS |
| コンテンツ | Markdown (Frontmatter) + ギャラリーフォルダ |
| ストレージ | ローカルファイルシステム（将来: Cloudflare R2） |
| デプロイ | Docker + Cloudflare Tunnel |

---

## プロジェクト構成

```
images/
├── src/
│   ├── index.tsx                  # Hono エントリポイント・全ルーティング
│   ├── content.ts                 # ギャラリー自動スキャン + frontmatter解析
│   ├── storage.ts                 # StorageAdapter インターフェース + LocalStorage実装
│   ├── utils.ts                   # escapeHtml / escapeJs / sanitizeFilename
│   ├── style.css                  # Tailwind CSS + Arknightsテーマ + Masonry + グリッチ
│   ├── content/
│   │   └── galleries/             # ← ここにギャラリーフォルダを追加していく
│   │       ├── 2026-02-kyoto/
│   │       │   ├── index.md       # タイトル・説明・メタデータ
│   │       │   ├── DSC0001.jpg
│   │       │   └── DSC0002.jpg
│   │       └── 2025-12-sketch/
│   │           ├── index.md
│   │           └── sketch01.png
│   └── components/
│       ├── layout.tsx             # HUD + 2カラム骨格 + 45°黄線 + SystemLogPanel
│       ├── gallery-list.tsx       # GALLERY/LOGモード切替 + Masonryグリッド
│       ├── gallery-page.tsx       # 個別ギャラリー + ライトボックス + グリッチエフェクト
│       └── admin.tsx              # 管理パネルUI（認証・アップロード・編集）
├── public/
│   └── style.css                  # ビルド済みCSS
├── Dockerfile
└── package.json
```

---

## ギャラリーの追加方法（GitHub ベース）

### 1. フォルダを作る

`images/src/content/galleries/` 以下に、**スラッグ名のフォルダ** を作ります。
スラッグには英数字・ハイフン・アンダースコアのみ使用可能（例: `2026-03-osaka`）。

### 2. index.md を作る

フォルダ内に `index.md` を作成し、frontmatter でメタデータを記述します。

```markdown
---
title: 大阪の春
date: 2026-03-10
type: photo
location: 大阪
tags: street,snap,film
description: 道頓堀〜天王寺の散歩スナップ
cover: DSC0001.jpg
---

ここにギャラリーの紹介文を自由に書ける（Markdown対応）
```

#### frontmatter フィールド一覧

| フィールド | 必須 | 説明 |
|------------|------|------|
| `title` | ✅ | ギャラリータイトル |
| `date` | ✅ | 撮影日（`YYYY-MM-DD`形式） |
| `type` | - | `photo` / `illustration` / `mixed`（デフォルト: `photo`） |
| `location` | - | 撮影場所 |
| `tags` | - | タグ（カンマ区切り） |
| `description` | - | 一覧ページに表示する短い説明文 |
| `cover` | - | サムネイルに使う画像ファイル名 |

### 3. 画像ファイルを置く

同じフォルダに画像ファイルを追加します。対応フォーマット: `jpg`, `jpeg`, `png`, `webp`, `gif`。

### 4. GitHub にプッシュ

```bash
git add .
git commit -m "feat: 大阪の春ギャラリーを追加"
git push
```

CI/CD が自動でデプロイします。フォルダが追加されるだけで、新しいページが自動生成されます。

---

## Web管理画面からの追加・編集

`https://images.yourdomain.com/admin` にアクセスして管理画面を開きます。

### 認証

環境変数 `ADMIN_PASSWORD` に設定したパスワードでログインします（Basic Auth）。
**必ず本番環境では `docker-compose.yml` のデフォルトパスワードを変更してください。**

### できること

| 操作 | 場所 |
|------|------|
| ギャラリー一覧を確認 | `/admin/galleries` |
| 新規ギャラリー作成 | `/admin/gallery/new` |
| タイトル・説明文を編集 | `/admin/gallery/:slug/edit` |
| 画像をアップロード（D&D対応） | `/admin/gallery/:slug/upload` |

---

## URL 構成

| URL | 説明 |
|-----|------|
| `/` | ギャラリー一覧トップ（GALLERY/LOGモード切替可） |
| `/?mode=gallery` | ギャラリーモード（Masonryタイル表示） |
| `/?mode=log` | ログモード（時系列ブログ形式） |
| `/?tag=<タグ>` | タグフィルタ |
| `/:slug` | 個別ギャラリーページ |
| `/galleries/:slug/images/:filename` | 画像ファイル直接配信 |
| `/admin` | 管理パネル（Basic Auth必須） |

---

## 開発・起動

```bash
cd images/

# 依存関係インストール
bun install

# ローカル開発サーバー
bun run dev   # → http://localhost:3001

# Tailwind CSS ビルド（別ターミナルで）
bun run build:css

# テスト実行
bun test
```

---

## Docker 起動

```bash
# リポジトリルートで
docker compose up -d

# または images サービスのみ
docker compose up -d images
```

---

## docker-compose.yml 設定

```yaml
services:
  portfolio:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
    restart: unless-stopped

  images:
    build: ./images
    ports:
      - "3001:3001"
    volumes:
      - ./images-data:/app/src/content/galleries  # コンテンツを永続化
    environment:
      - PORT=3001
      - ADMIN_PASSWORD=your-secure-password-here  # ← 必ず変更
    restart: unless-stopped
```

> **重要:** `./images-data` はホストマシン上に自動作成されます。コンテナを削除・再ビルドしてもギャラリーデータが消えません。

---

## Cloudflare Tunnel でのサブドメイン設定

Cloudflare Zero Trust ダッシュボードで以下を設定します。

```
images.yourdomain.com → localhost:3001
```

---

## ストレージアーキテクチャ（将来の Cloudflare R2 対応）

`storage.ts` の `StorageAdapter` インターフェースにより、バックエンドの差し替えが容易です。

```typescript
// 現在: LocalStorage（ファイルシステム）
const storage = new LocalStorage(GALLERIES_DIR);

// 将来: R2Storage に差し替えるだけ
// const storage = new R2Storage(R2_BUCKET_NAME, R2_ACCOUNT_ID, R2_API_TOKEN);
```

R2 移行時に変更が必要なのは `storage.ts` の実装のみで、他のコードは変更不要です。

---

## テスト

TDD で実装されており、ユニットテストで主要ロジックをカバーしています。

```bash
bun test
```

| テストファイル | テスト数 | カバー範囲 |
|---------------|---------|-----------|
| `storage.test.ts` | 15 | パストラバーサル対策・ファイル操作・バリデーション |
| `content.test.ts` | 18 | スラッグ検証・重複検出・frontmatterパース |
| **計** | **33** | |

---

## セキュリティ

- **パストラバーサル対策:** スラッグは `^[a-zA-Z0-9_-]+$` の正規表現で検証
- **XSS対策:** テンプレート内で `escapeHtml()` / `escapeJs()` を使用
- **ファイルアップロード:** 50MB上限・拡張子ホワイトリスト・ファイル名サニタイズ
- **管理画面:** Basic Auth（環境変数でパスワード管理）
