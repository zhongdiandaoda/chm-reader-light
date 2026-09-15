# CHMReaderLight - CHM-Reader für macOS

[English](./README.en.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | [Français](./README.fr.md) | **Deutsch** | [Português](./README.pt.md) | [Italiano](./README.it.md) | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#systemanforderungen)

Ein schlanker Offline-CHM-Reader für macOS. Lokale Handbücher lassen sich in einer Bibliothek verwalten und nach Inhaltsverzeichnis oder Text durchsuchen, ohne Dokumente hochzuladen oder ein Konto anzulegen.

**[Für macOS herunterladen](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[Aus dem Quellcode starten](#aus-dem-quellcode-starten)** · **[Projekt mit einem Star unterstützen](https://github.com/zhongdiandaoda/chm-reader-light)**

![Tatsächliche leere Bibliothek von CHMReaderLight](../assets/app-preview.png)

## Hauptfunktionen

- Sammlungen, Import per Drag-and-drop, Suche nach Titel oder Pfad und zuletzt gelesener Stand.
- Verschachtelte Inhaltsverzeichnisse, Inhalts- und Volltextsuche, Kapitelnavigation und Verlauf.
- Gespeicherte Zoomstufe, Textkodierung, Seitenleiste, Suchbereich und Leseposition pro Buch.
- Quelldateien in Finder anzeigen und neu verknüpfen; das Entfernen eines Eintrags löscht nicht die Originaldatei.
- Skripte, Formulare, Pop-ups, verschachtelte Frames und Netzwerkzugriffe aus CHM-Dateien werden standardmäßig blockiert.
- Ausschließlich für Apple-Silicon-Macs, ohne Telemetrie, Konten oder Cloud-Synchronisierung.

## Download und Installation

`CHMReaderLight-mac-arm64.zip` von [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) herunterladen und mit der zugehörigen `.zip.sha256`-Datei prüfen:

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

Aktuelle Builds haben keine Apple notarization. Falls macOS den ersten Start blockiert, die App unter **Systemeinstellungen > Datenschutz & Sicherheit** erlauben. Weitere Schritte stehen in der [Installationsanleitung](../install-macos.md).

## Grundlegende Verwendung

1. „CHM hinzufügen“ auswählen oder `.chm`-Dateien in die Bibliothek ziehen.
2. Handbücher in Sammlungen organisieren und nach Titel oder Pfad filtern.
3. Ein Dokument öffnen und Inhaltsverzeichnis oder Text durchsuchen; bei Darstellungsproblemen die Textkodierung wechseln.
4. Mit `Command+O` Dateien hinzufügen, mit `Command+F` suchen und mit `Command+L` zur Bibliothek zurückkehren.

Die App speichert ausschließlich Quellpfade und Leseeinstellungen. Weitere Informationen: [Datenschutz](../privacy.md), [Kompatibilität](../compatibility.md) und [Fehlerbehebung](../troubleshooting.md).

## Systemanforderungen

- macOS 12 oder neuer
- Mac mit Apple Silicon
- Node.js 22 oder neuer für die Ausführung aus dem Quellcode

## Aus dem Quellcode starten

~~~bash
npm install
npm run run
~~~

Zur Prüfung `npm test` und `npm run check` ausführen. Mit `npm run package:mac` wird die aktuelle Architektur paketiert.

## Support und Mitwirkung

Bei Fragen [SUPPORT.md](../../SUPPORT.md) lesen oder ein [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose) öffnen. Sicherheitshinweise stehen in [SECURITY.md](../../SECURITY.md), Hinweise zur Mitwirkung in [CONTRIBUTING.md](../../CONTRIBUTING.md).

[MIT-Lizenz](../../LICENSE) · [Hinweise zu Drittanbietern](../../THIRD_PARTY_NOTICES.md)
