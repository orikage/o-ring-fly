---
title: Proxmox LXC コンテナ環境の構築
date: 2026-01-15
tags: [Infrastructure, Proxmox, Docker]
---

## 環境の概要

Proxmox上にLXCコンテナを作成し、Docker経由でポートフォリオサーバーを運営している。
リソース消費を最小限に抑えつつ、信頼性の高い環境を実現した。

## LXC コンテナの設定

- **Template**: Ubuntu 22.04 LTS
- **CPU**: 1 Core
- **Memory**: 512 MB
- **Storage**: 8 GB (local-lvm)

この構成でHono + Bunのサーバーは問題なく稼働する。

## Dockerのインストール

```bash
apt update && apt install -y docker.io docker-compose
systemctl enable docker
systemctl start docker
```

## Cloudflare Tunnel の設定

Cloudflare Tunnelを使用し、自宅サーバーを外部から安全に公開している。
NAT越えの問題を完全に回避できるため、自宅ホスト環境では最も実用的なアプローチだと感じた。

## 今後の課題

- 自動デプロイ（GitHub Actions → Cloudflare Pages の検討）
- バックアップ自動化
- 監視ダッシュボードの導入
