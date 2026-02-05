---
title: Hono × Bun でポートフォリオを再構築
date: 2026-02-01
tags: [Development, Hono, Bun]
---

## なぜ Hono か

Next.jsは強力だが、単純なポートフォリオサイトにとってはオverkill。
起動時間やメモリ消費が大きすぎる。

Honoは以下の点で魅力的だった：

- **軽量**: インストールサイズが小さく、起動がミリ秒単位
- **JSX対応**: Reactなしでコンポーネント開発が可能
- **Bun Ready**: Bunのネイティブサポートで最大限のパフォーマンス

## アーキテクチャ

```
src/
├── components/    # Layout, HomePage, Article
├── content/       # .md ファイル（このファイルも含む）
├── index.tsx      # ルーティング・エントリポイント
├── content.ts     # Markdown読み込みユーティリティ
└── style.css      # Tailwind + タクティカルテーマ
```

## Markdown の扱い

Frontmatterを使って記事メタデータを管理し、`marked`でHTMLに変換する。
データベースは一切不要で、Git自体がバックアップになる。

## パフォーマンス計測

起動時間：約50ms（Bun + Hono）
メモリ消費：約30-40MB（Proxmox LXCで十分）
