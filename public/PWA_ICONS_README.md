# PWAアイコンファイルの準備

PWAを正常に動作させるためには、以下のアイコンファイルが必要です。

## 必要なアイコンファイル

1. **pwa-192x192.png** (192x192ピクセル)
   - PWAの標準アイコン（小）
   - ホーム画面のアイコンとして使用

2. **pwa-512x512.png** (512x512ピクセル)
   - PWAの標準アイコン（大）
   - スプラッシュスクリーンやインストール時の表示に使用

3. **apple-touch-icon.png** (180x180ピクセル)
   - iOS用のアイコン
   - Safariで「ホーム画面に追加」時に使用

## アイコンの作成方法

既存の `Group 1.png` をベースに、以下のサイズでアイコンを作成してください：

1. 画像編集ソフト（Photoshop、GIMP、Canva等）で `Group 1.png` を開く
2. 各サイズ（192x192、512x512、180x180）にリサイズ
3. 背景を透明または白に設定（推奨）
4. `public` フォルダに保存

## 一時的な対応

開発中は、既存の `Group 1.png` をコピーして以下のファイル名で保存することで動作確認できます：

```bash
# Windows PowerShell
Copy-Item "public/Group 1.png" "public/pwa-192x192.png"
Copy-Item "public/Group 1.png" "public/pwa-512x512.png"
Copy-Item "public/Group 1.png" "public/apple-touch-icon.png"
```

ただし、本番環境では適切なサイズのアイコンを使用してください。

