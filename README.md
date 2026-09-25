# RelaGrid

グリッドにアイコンノードを配置し、矢印で接続する関係図エディタです。
[Gridgram](https://gridgram.ideamans.com/) のようなデザインを、ブラウザだけで完結する
静的Webアプリとして実装しています（サーバー・ビルド不要、外部依存ライブラリなし）。

## 使い方

`index.html` をブラウザで開くだけで動作します。ビルドやインストールは不要です。

ローカルでサーバー経由で試す場合:

```bash
python -m http.server 8000
```

その後 `http://localhost:8000/` を開きます。

GitHub Pagesで公開する場合は、リポジトリの Settings → Pages → Source を
「Deploy from a branch」「main」に設定してください。

## 機能

- **GUI編集**: ツールバーで 選択 / ノード / 接続 / ゾーン / ノート を切り替えてキャンバス上で作図
- **テキストDSL**: 独自の簡潔な記法とGUIが双方向に同期（下記「DSL構文」参照）
- ノード・接続線・色付きゾーン・注釈ノート、38種類のアイコン、9色パレット
- ライト/ダークテーマ、Undo/Redo
- SVG / PNG / PNG(16:9) / JSON / テキストへの書き出し、JSON・テキストの読み込み
- ブラウザのlocalStorageへの自動保存

## DSL構文

```
grid 4x3                 # 列x行のグリッドサイズ
theme dark                # light | dark (省略時 light)
title "図のタイトル"        # 上部に表示（任意）
source "参考: ○○ 判例コラム" # 右下に小さく表示（任意）

zone A1:B2 "Public zone" color=blue
node api B1 icon=server size=1.2 color=blue "API"

api -> db "SQL"            # ->  単方向
api <-> cache "sync"       # <-> 双方向 / <- 逆方向 / -- 矢印なし
api -> db "SQL" style=dashed color=red width=2

note api "SLA 99.95%\np99<200ms" pos=bottom

# 行頭の # はコメント
```

アイコン名の例: `user` `users` `laptop` `mobile` `browser` `server` `database`
`cloud` `globe` `wifi` `plug` `queue` `gear` `cpu` `disk` `lock` `unlock`
`shield` `mail` `bell` `clock` `bolt` `refresh` `chart` `folder` `file`
`card` `pin` `search` `filter` `link` `git` `code` `terminal` `check`
`x` `warning` `plus` `box`

GUIで編集すると、テキストは自動的にこの記法へ整形されます。

## 構成

```
index.html
css/style.css
js/
  icons.js       アイコン素材（オリジナル・依存なし）
  colors.js      配色パレット
  model.js       データモデル / グリッド参照ヘルパー
  parser.js      DSLテキスト -> モデル
  serializer.js  モデル -> DSLテキスト
  renderer.js    モデル -> SVG描画
  samples.js     サンプル図
  app.js         GUI操作・状態管理・書き出し
```

## 既知の制約（v1）

- 接続線は直線のみ（直交ルーティング未対応）
- GUI操作のたびにテキストは正規形へ整形されるため、独自フォーマットやコメントは保持されません
- サーバー保存・共有機能なし（ブラウザ内で完結する設計のため）
