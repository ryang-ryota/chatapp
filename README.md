# chatapp - Node.js × React チャットアプリ

<div>
  <video controls src="https://github.com/user-attachments/assets/a041cc6c-7e53-41a5-b0f2-81fcb65fcba1" muted="false" style="max-width: 100%;"></video>
</div>

このリポジトリは、**Node.js（Express）とReact、MongoDB**を用いた1対1・グループチャットアプリの学習用サンプルです。  
リアルタイムチャット、ファイル送受信、認証機能などを備えています。

---

## 特徴

- ユーザー登録・ログイン（セッション認証）
- 1対1チャット／グループチャット
- ファイルのアップロード・ダウンロード（画像プレビュー対応）
- リアルタイム通信（Socket.IO）
- フロントエンド：React + Tailwind CSS

---

## セットアップ

### 前提

- Node.js
- MongoDB（ローカル）

### 1. サーバー起動

```
cd backend
npm install
npx nodemon app.js
```

### 2. フロントエンド起動

```
cd frontend
npm install
npm start
```

### 3. 利用方法

- ブラウザで `http://localhost:3000` を開きます。
- ユーザー登録後、チャット・グループ作成・ファイル送信などをお試しください。

---

## 注意

- 本システムは**学習目的**のサンプルです。  
- セキュリティや運用面の考慮は最小限です。商用利用・本番運用は推奨しません。

---

## ライセンス

MIT
