# ラクガキクエスト

自分で描いた主人公が戦う、スマホ縦型の育成オートバトルです。

## 遊べる機能

- タッチ対応のお絵描きキャンバス
- 描いた主人公による自動戦闘
- 戦闘後に3枚から選ぶ「ひらめき」強化
- 10戦目のボスと短い会話
- 拠点施設による最大12時間の放置報酬
- 端末内への自動保存
- PWA（ホーム画面への追加）対応

## GitHub Pagesで公開する

1. このフォルダの中身をGitHubリポジトリの直下へアップロードします。
2. リポジトリの `Settings` → `Pages` を開きます。
3. `Build and deployment` の `Source` を `Deploy from a branch` にします。
4. Branchを `main`、フォルダを `/(root)` にして `Save` を押します。

数分後、`https://ユーザー名.github.io/リポジトリ名/` で遊べます。

## ローカル確認

`index.html` をブラウザで開くだけでも動きます。PWAの動作確認にはHTTPサーバーが必要です。

```bash
python -m http.server 8080
```

その後 `http://localhost:8080` を開いてください。
