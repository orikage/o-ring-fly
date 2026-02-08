---
title: Cloudflare Tunnel で自宅サーバーを安全に公開する
date: 2026-02-01
tags: Cloudflare, Tunnel, Network, Security
---

## Cloudflare Tunnel とは

自宅サーバーにポート開放やVPNを使わず、安全に公開できる仕組みです。
Cloudflareのエッジサーバーが中介し、あなたのサーバーから接続を発信するため、
ファイアウォールの裏側にある構成でも問題なく動きます。

## 事前要件

- Cloudflare アカウント（無料で可）
- `cloudflared` CLI がインストール済み
- 公開したいサーバー（Proxmox LXC / Docker コンテナ等）

![ネットワーク構成イメージ](/content/resource/img/cloudflare-tunnel-diagram.png)

## 設定手順

### 1. Cloudflare ダッシュボードで Tunnel 作成

1. [Zero Trust → Tunnels](https://one.dash.cloudflare.com/) へ
2. 「Create a tunnel」を選択
3. Connector として `cloudflared` を選択
4. インストール手順に従って `cloudflared` をセットアップ

### 2. ルーティング設定

```yaml
# ~/.cloudflared/config.yml
ingress:
  - hostname: portfolio.yourdomain.com
    service: http://localhost:3000
  - catch_all
    service: busy
```

### 3. DNS の設定

Cloudflareの DNS に CNAME レコードを追加。
Tunnel で自動生成されたURLを指定すれば完了です。

## docker-compose との組み合わせ

```yaml
services:
  portfolio:
    build: .
    ports:
      - "3000:3000"

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --config /etc/cloudflared run
    volumes:
      - ~/.cloudflared:/etc/cloudflared:ro
    depends_on:
      - portfolio
```

## セキュリティポイント

- **ポート開放なし**: 外向きの接続のみで動作
- **DDoS保護**: Cloudflareのエッジが自動で対応
- **アクセス制御**: Zero Trust のポリシーで認証を追加可能
