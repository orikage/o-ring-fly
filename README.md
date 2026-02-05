# O-ring fly Portfolio

Arknights Endfield のタクティカルUI に触発されたポートフォリオサイト。
Three.js による3D背景と、ミニマリスト設計のコンテンツ表示を組み合わせた構成です。

## スタック

| カテゴリ | 技術 |
|----------|------|
| フロントエンド | HTML5 / CSS3 / JavaScript |
| 3Dグラフィクス | [Three.js](https://threejs.org/) v0.160.0 |
| デプロイ | GitHub Pages |

## プロジェクト構成

```
o-ring-fly/
├── index.html              # メインページ (Endfield Tactical Terminal v5.0)
├── index_embedded.html     # 旧バージョン (PRTS Terminal v4.0, Canvas API)
├── splash.png              # キャラクター イラスト
├── splash_small.png        # キャラクター イラスト (最適化済み)
├── .github/
│   └── workflows/
│       ├── deploy.yml      # GitHub Pages デプロイ
│       ├── claude.yml      # Claude Code 連携
│       └── claude-review.yml
└── README.md
```

## バージョン履歴

| バージョン | グラフィクス | ファイル |
|------------|--------------|----------|
| v5.0 (現在) | Three.js (WebGL) | `index.html` |
| v4.0 | Canvas 2D | `index_embedded.html` |

## デプロイ

`main` ブランチへのプッシュで、GitHub Pages に自動デプロイされます。
