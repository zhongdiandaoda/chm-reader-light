# CHMReaderLight - macOS CHM 閱讀器

[English](./README.en.md) | [简体中文](./README.zh-CN.md) | **繁體中文** | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Italiano](./README.it.md) | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#系統需求)

一款輕量、離線的 macOS CHM 閱讀器。使用書庫管理本機手冊、搜尋目錄與內文，無需上傳文件或建立帳號。

**[下載 macOS 版本](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[從原始碼執行](#從原始碼執行)** · **[為專案加星](https://github.com/zhongdiandaoda/chm-reader-light)**

![CHMReaderLight 實際空書庫畫面](../assets/app-preview.png)

## 主要功能

- 書庫分組、拖放匯入、依書名或路徑搜尋，以及最近閱讀狀態。
- 多層目錄、目錄搜尋、全文搜尋、章節切換和歷史前進/後退。
- 儲存縮放、文字編碼、側邊欄、搜尋範圍和每本書的閱讀位置。
- 可在 Finder 中定位或重新連結來源檔案；移除書庫記錄不會刪除原始檔案。
- 預設阻擋 CHM 內的指令碼、表單、彈出視窗、巢狀 frame 和網路連線。
- 僅支援 Apple Silicon Mac，不包含遙測、帳號或雲端同步。

## 下載與安裝

從 [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) 下載 `CHMReaderLight-mac-arm64.zip`，並使用配套的 `.zip.sha256` 驗證：

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

目前版本尚未完成 Apple notarization。若首次啟動被 macOS 阻擋，請前往 **系統設定 > 隱私權與安全性** 確認開啟。詳細步驟請參閱[安裝指南](../install-macos.md)。

## 基本使用

1. 按一下「加入 CHM」，或將 `.chm` 檔案拖入書庫。
2. 使用分組整理手冊，並依書名或路徑篩選。
3. 開啟文件後搜尋目錄或內文；若出現亂碼，可切換文字編碼。
4. 快捷鍵：`Command+O` 加入檔案、`Command+F` 搜尋、`Command+L` 返回書庫。

應用程式只儲存來源路徑與閱讀偏好。另請參閱[隱私說明](../privacy.md)、[相容性說明](../compatibility.md)和[疑難排解](../troubleshooting.md)。

## 系統需求

- macOS 12 或更新版本
- Apple Silicon Mac
- 從原始碼執行需要 Node.js 22 或更新版本

## 從原始碼執行

~~~bash
npm install
npm run run
~~~

執行 `npm test` 和 `npm run check` 進行檢查；使用 `npm run package:mac` 打包目前架構。

## 支援與貢獻

使用問題請查看 [SUPPORT.md](../../SUPPORT.md) 或提交 [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose)。安全問題請參閱 [SECURITY.md](../../SECURITY.md)，貢獻方式請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

[MIT License](../../LICENSE) · [第三方授權聲明](../../THIRD_PARTY_NOTICES.md)
