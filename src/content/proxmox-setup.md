---
title: Proxmox + LXC で自宅サーバーを構築する
date: 2026-01-15
tags: Proxmox, Infrastructure, Docker, LXC
---

## 自宅サーバーの動機

クラウド依存を減らし、データを自己管理したい。
Proxmoxは無料で、LXCコンテナ＋VirtualMachineの両方を扱えるため、実験スタックとして理想的です。

![Proxmox管理画面イメージ](/content/resource/img/proxmox-dashboard.png)

## インストール手順

### 1. Proxmox VE のインストール

1. [Proxmox Download](https://www.proxmox.com/en/downloads) から ISO を取得
2. USB メモリにブート可能なイメージを書き込む（Rufus / balenaEtcher）
3. ベアメタルサーバーに接続してインストール

### 2. LXC コンテナの作成

Proxmox ウェブ管理画面から「Create CT」を選択。
Ubuntu 24.04 のテンプレートを使用し、以下リソースを割り当てる：

| リソース | 推奨値 |
|----------|--------|
| CPU | 2 Core |
| Memory | 2 GB |
| Storage | 20 GB |

### 3. Docker のインストール（LXC内）

```bash
apt update && apt install -y docker.io docker-compose
systemctl enable --now docker
```

## 運用ポイント

- **バックアップ**: Proxmox の自動バックアップ＋ Git リポジトリで設定ファイルの版管理
- **ネットワーク**: Cloudflare Tunnel で公開。VPN は不要
- **監視**: Grafana + Prometheus で軽量監視 (別記事で詳細予定)
