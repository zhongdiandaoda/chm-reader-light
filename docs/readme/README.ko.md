# CHMReaderLight - macOS용 CHM 리더

[English](./README.en.md) | [简体中文](../../README.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | **한국어** | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Italiano](./README.it.md) | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#시스템-요구-사항)

macOS용 가벼운 오프라인 CHM 리더입니다. 로컬 설명서를 라이브러리로 관리하고 목차와 본문을 검색할 수 있으며, 문서 업로드나 계정이 필요하지 않습니다.

**[macOS 버전 다운로드](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[소스에서 실행](#소스에서-실행)** · **[프로젝트에 Star 추가](https://github.com/zhongdiandaoda/chm-reader-light)**

![CHMReaderLight의 실제 빈 라이브러리 화면](../assets/app-preview.png)

## 주요 기능

- 컬렉션, 드래그 앤 드롭 가져오기, 제목 또는 경로 검색, 최근 읽기 상태.
- 계층형 목차, 목차 검색, 본문 검색, 장 이동, 기록 뒤로/앞으로.
- 확대/축소, 문자 인코딩, 사이드바, 검색 범위, 책별 읽기 위치 저장.
- Finder에서 원본 파일 표시 및 다시 연결. 라이브러리에서 제거해도 원본 파일은 삭제되지 않습니다.
- CHM의 스크립트, 양식, 팝업, 중첩 frame 및 네트워크 연결을 기본 차단합니다.
- Apple Silicon Mac 전용이며 원격 측정, 계정, 클라우드 동기화가 없습니다.

## 다운로드 및 설치

[GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases)에서 `CHMReaderLight-mac-arm64.zip`을 다운로드하고 함께 제공되는 `.zip.sha256` 파일로 확인하세요.

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

현재 빌드는 Apple notarization을 완료하지 않았습니다. macOS가 첫 실행을 차단하면 **시스템 설정 > 개인정보 보호 및 보안**에서 열기를 허용하세요. 자세한 내용은 [설치 안내](../install-macos.md)를 참조하세요.

## 기본 사용법

1. "CHM 추가"를 선택하거나 `.chm` 파일을 라이브러리로 드래그하세요.
2. 컬렉션으로 설명서를 정리하고 제목 또는 경로로 필터링하세요.
3. 문서를 열어 목차나 본문을 검색하고, 글자가 깨지면 문자 인코딩을 변경하세요.
4. `Command+O`로 파일 추가, `Command+F`로 검색, `Command+L`로 라이브러리로 돌아갑니다.

앱은 원본 경로와 읽기 환경설정만 저장합니다. [개인정보 보호](../privacy.md), [호환성](../compatibility.md), [문제 해결](../troubleshooting.md)도 참조하세요.

## 시스템 요구 사항

- macOS 12 이상
- Apple Silicon Mac
- 소스 실행에는 Node.js 22 이상 필요

## 소스에서 실행

~~~bash
npm install
npm run run
~~~

`npm test`와 `npm run check`로 검사하고, `npm run package:mac`으로 현재 아키텍처를 패키징합니다.

## 지원 및 기여

사용 문의는 [SUPPORT.md](../../SUPPORT.md) 또는 [Issues](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose)를 이용하세요. 보안 문제는 [SECURITY.md](../../SECURITY.md), 기여 방법은 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 참조하세요.

[MIT License](../../LICENSE) · [타사 고지](../../THIRD_PARTY_NOTICES.md)
