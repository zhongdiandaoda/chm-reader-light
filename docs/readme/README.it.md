# CHMReaderLight - Lettore CHM per macOS

[English](./README.en.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | **Italiano** | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#requisiti)

Un lettore CHM leggero e offline per macOS. Organizza i manuali locali in una libreria e cerca nell'indice o nel testo, senza caricare documenti né creare un account.

**[Scarica per macOS](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[Avvia dal codice sorgente](#avvia-dal-codice-sorgente)** · **[Aggiungi una stella al progetto](https://github.com/zhongdiandaoda/chm-reader-light)**

![Libreria vuota reale di CHMReaderLight](../assets/app-preview.png)

## Funzionalità principali

- Raccolte, importazione tramite trascinamento, ricerca per titolo o percorso e stato delle letture recenti.
- Indice gerarchico, ricerca nell'indice e nel testo, navigazione tra capitoli e cronologia.
- Salvataggio di zoom, codifica del testo, barra laterale, ambito di ricerca e posizione di lettura per ogni libro.
- Visualizzazione e ricollegamento del file sorgente nel Finder; la rimozione di una voce non elimina il file originale.
- Blocco predefinito di script, moduli, popup, frame annidati e connessioni di rete contenuti nei CHM.
- Supporto esclusivo per Mac Apple Silicon, senza telemetria, account o sincronizzazione cloud.

## Download e installazione

Scarica `CHMReaderLight-mac-arm64.zip` da [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) e verificalo con il relativo file `.zip.sha256`:

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

Le build attuali non dispongono di Apple notarization. Se macOS blocca il primo avvio, consenti l'apertura da **Impostazioni di Sistema > Privacy e sicurezza**. Consulta la [guida all'installazione](../install-macos.md).

## Utilizzo di base

1. Seleziona "Aggiungi CHM" oppure trascina i file `.chm` nella libreria.
2. Organizza i manuali in raccolte e filtrali per titolo o percorso.
3. Apri un documento e cerca nell'indice o nel testo; cambia la codifica se i caratteri non vengono visualizzati correttamente.
4. Usa `Command+O` per aggiungere file, `Command+F` per cercare e `Command+L` per tornare alla libreria.

L'app memorizza solo i percorsi sorgente e le preferenze di lettura. Consulta [Privacy](../privacy.md), [Compatibilità](../compatibility.md) e [Risoluzione dei problemi](../troubleshooting.md).

## Requisiti

- macOS 12 o versioni successive
- Mac con Apple Silicon
- Node.js 22 o versioni successive per l'esecuzione dal codice sorgente

## Avvia dal codice sorgente

~~~bash
npm install
npm run run
~~~

Esegui `npm test` e `npm run check` per verificare il progetto. Usa `npm run package:mac` per creare il pacchetto per l'architettura corrente.

## Supporto e contributi

Per domande, consulta [SUPPORT.md](../../SUPPORT.md) o apri una [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose). Per la sicurezza consulta [SECURITY.md](../../SECURITY.md); per contribuire, [CONTRIBUTING.md](../../CONTRIBUTING.md).

[Licenza MIT](../../LICENSE) · [Avvisi di terze parti](../../THIRD_PARTY_NOTICES.md)
