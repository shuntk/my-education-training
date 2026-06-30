# さんすう10もんチャレンジ

小学1・2年生向けの、たし算・ひき算10問チャレンジアプリです。

## Features

- 1桁、1桁くり上がり、2桁、2桁くり上がり、3桁、3桁くり上がり
- たし算、ひき算、ミックス
- 10問ランダム出題
- 同じチャレンジ内では同じ式をなるべく出さない
- 正解数と解答時間を記録
- New Record時の紙ふぶき演出
- 名前登録とランキング
- PWA対応

## Data

記録は各端末のブラウザの `localStorage` に保存されます。

保存キー:

```text
math10-progress-v1
```

端末間で記録は共有されません。

## GitHub Pages

このリポジトリは静的サイトです。GitHub Pagesでは以下の設定で公開できます。

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

公開後は `https://<username>.github.io/<repository>/` でアクセスできます。
