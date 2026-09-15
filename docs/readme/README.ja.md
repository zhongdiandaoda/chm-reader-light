# CHMReaderLight - macOS 用 CHM リーダー

[English](./README.en.md) | [简体中文](../../README.md) | [繁體中文](./README.zh-TW.md) | **日本語** | [한국어](./README.ko.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Italiano](./README.it.md) | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#動作環境)

macOS 向けの軽量なオフライン CHM リーダーです。ローカルのマニュアルをライブラリで整理し、目次や本文を検索できます。文書のアップロードやアカウント登録は不要です。

**[macOS 版をダウンロード](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[ソースから実行](#ソースから実行)** · **[Star を付ける](https://github.com/zhongdiandaoda/chm-reader-light)**

![CHMReaderLight の実際の空ライブラリ画面](../assets/app-preview.png)

## 主な機能

- コレクション、ドラッグ＆ドロップでの追加、タイトルやパスの検索、最近読んだ状態の管理。
- 階層化された目次、目次検索、全文検索、章の移動、履歴の戻る/進む。
- ズーム、文字エンコーディング、サイドバー、検索範囲、書籍ごとの閲覧位置を保存。
- Finder で元ファイルを表示し、移動後は再リンク可能。ライブラリから削除しても元ファイルは削除しません。
- CHM 内のスクリプト、フォーム、ポップアップ、入れ子 frame、ネットワーク接続を標準でブロック。
- Apple Silicon Mac 専用。テレメトリ、アカウント、クラウド同期はありません。

## ダウンロードとインストール

[GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) から `CHMReaderLight-mac-arm64.zip` をダウンロードし、付属の `.zip.sha256` で確認します。

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

現在のビルドは Apple の notarization を完了していません。初回起動がブロックされた場合は、**システム設定 > プライバシーとセキュリティ** で開くことを許可してください。詳しくは[インストールガイド](../install-macos.md)を参照してください。

## 基本的な使い方

1. 「CHM を追加」を選ぶか、`.chm` ファイルをライブラリへドラッグします。
2. コレクションで整理し、タイトルまたはパスで絞り込みます。
3. 文書を開いて目次や本文を検索します。文字化けする場合はエンコーディングを変更します。
4. `Command+O` で追加、`Command+F` で検索、`Command+L` でライブラリへ戻ります。

アプリが保存するのは元ファイルのパスと閲覧設定だけです。[プライバシー](../privacy.md)、[互換性](../compatibility.md)、[トラブルシューティング](../troubleshooting.md)も参照してください。

## 動作環境

- macOS 12 以降
- Apple Silicon Mac
- ソースから実行する場合は Node.js 22 以降

## ソースから実行

~~~bash
npm install
npm run run
~~~

検証には `npm test` と `npm run check`、現在のアーキテクチャのパッケージ作成には `npm run package:mac` を使用します。

## サポートとコントリビューション

利用上の質問は [SUPPORT.md](../../SUPPORT.md) または [Issues](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose) へ。セキュリティについては [SECURITY.md](../../SECURITY.md)、コントリビューションについては [CONTRIBUTING.md](../../CONTRIBUTING.md) を参照してください。

[MIT License](../../LICENSE) · [サードパーティ通知](../../THIRD_PARTY_NOTICES.md)
