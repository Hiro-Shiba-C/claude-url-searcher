# サイト構造解析ツール (URL Searcher)

Webサイトの構造を自動解析し、重要なページを効率よく抽出するツールです。

## 🎯 概要

- **目的**: サイト構造の調査負担を軽減し、重要ページを自動で抽出
- **対象**: デザイナー、PDM、マーケター等のサイト分析業務担当者
- **機能**: URL探索、重要度スコアリング、結果のCSV出力

## 🏗️ アーキテクチャ

```
Next.js (Frontend) → FastAPI (Backend) → Puppeteer (Crawler)
     ↓
GUI表示・CSV出力
```

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 + TailwindCSS + TypeScript
- **バックエンド**: FastAPI + Python 3.7+
- **クローラー**: Puppeteer + Node.js
- **出力**: JSON → CSV

## 📋 機能一覧

### ✅ 実装済み機能
- [x] URL入力フォーム
- [x] 探索深度選択（1-3階層）
- [x] サイト構造クロール
- [x] 重要度スコアリング
- [x] 結果表示（表形式）
- [x] CSV出力機能
- [x] サブドメイン対応
- [x] 外部ドメイン除外
- [x] エラーハンドリング

### 🚧 対応中の課題
- [ ] Puppeteer環境依存関係
- [ ] WSL環境での最適化

## 🚀 セットアップ

### 前提条件
- Node.js 18+
- Python 3.7+
- npm or yarn

### インストール

1. **リポジトリクローン**
```bash
git clone https://github.com/Hiro-Shiba-C/claude-url-searcher.git
cd claude-url-searcher
```

2. **依存関係一括インストール**
```bash
npm run install:all
```

3. **個別セットアップ（必要に応じて）**

**フロントエンド:**
```bash
cd frontend
npm install
```

**バックエンド:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**クローラー:**
```bash
cd backend/crawler
npm install
```

## 🎮 使用方法

### 1. 開発サーバー起動

**同時起動（推奨）:**
```bash
npm run dev
```

**個別起動:**
```bash
# バックエンド
npm run dev:backend

# フロントエンド
npm run dev:frontend
```

### 2. アプリケーション使用
1. ブラウザで `http://localhost:3000` にアクセス
2. 対象URLを入力（例: `https://example.com`）
3. 探索深度を選択
4. 「解析開始」をクリック
5. 結果を確認し、必要に応じてCSV出力

## 🔧 トラブルシューティング

### Puppeteerエラーの場合
WSL/Linux環境でPuppeteerに必要なライブラリをインストール:

```bash
sudo apt update && sudo apt install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
  libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
  libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils \
  libgbm-dev
```

### APIエラーの場合
- バックエンドサーバーが起動しているか確認: `http://localhost:8000`
- CORS設定が適切か確認
- ログでエラー詳細を確認

## 📊 重要度スコアリング

現在のスコアリング基準:
- **深度**: 浅い階層ほど高スコア
- **URL構造**: 重要キーワード（contact, about, service等）を含む
- **ホームページ**: 最高スコア
- **コンテンツ量**: 適度な長さのコンテンツを評価

## 🛣️ ロードマップ

### 短期目標
- [ ] Puppeteer環境問題の解決
- [ ] 統合テスト完了
- [ ] 重要度アルゴリズム改善

### 中期目標
- [ ] UI/UX改善（進捗バー、フィルタリング）
- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化

### 長期目標
- [ ] データ永続化
- [ ] 履歴機能
- [ ] 高度な分析機能

## 🤝 貢献

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 ライセンス

MIT License

## 📞 サポート

- GitHub Issues: [プロジェクトIssues](https://github.com/Hiro-Shiba-C/claude-url-searcher/issues)
- プロジェクト管理: `TASKS.md` を参照

---

**最終更新**: 2025-06-22
**ステータス**: 開発中（90%完成）
