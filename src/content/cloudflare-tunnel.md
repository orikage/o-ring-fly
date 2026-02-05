---
title: Cloudflare Tunnel の導入記
date: 2026-01-20
tags: [Network, Cloudflare, Security]
---

## Cloudflare Tunnel とは

自宅サーバーをインターネットに公開する際、通常はポートフォワーディングやDDNSが必要だが、
Cloudflare Tunnelを使えばこれらが一切不要になる。

サーバー側からCloudflareへの接続を維持し、DNSで自動的にルーティングされる。

## 導入手順

1. Cloudflare アカウント作成
2. ドメインの取得と DNS 管理を Cloudflare に移行
3. `cloudflared` のインストall

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/linux_amd64/cloudflared -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

4. Tunnel の作成と認証

```bash
cloudflared tunnel login
cloudflared tunnel create my-portfolio
```

5. `config.yml` の設定と systemd サービス登録

## なぜこれが最適か

- **NAT越え不要**: 自宅のIPが変わっても問題ない
- **TLS自動**: SSL証明書の管理不要
- **セキュリティ**: IPアドレスは公開されない
- **無料枠**: 個人利用なら無料プラン十分
