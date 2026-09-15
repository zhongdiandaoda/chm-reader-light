# CHMReaderLight - Lecteur CHM pour macOS

[English](./README.en.md) | [简体中文](../../README.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | **Français** | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Italiano](./README.it.md) | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#configuration-requise)

Un lecteur CHM léger et hors ligne pour macOS. Organisez vos manuels locaux dans une bibliothèque et recherchez dans leur sommaire ou leur contenu, sans téléverser de documents ni créer de compte.

**[Télécharger pour macOS](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[Exécuter depuis les sources](#exécuter-depuis-les-sources)** · **[Ajouter une étoile](https://github.com/zhongdiandaoda/chm-reader-light)**

![Bibliothèque vide réelle de CHMReaderLight](../assets/app-preview.png)

## Fonctionnalités principales

- Collections, importation par glisser-déposer, recherche par titre ou chemin et suivi des lectures récentes.
- Sommaire hiérarchique, recherche dans le sommaire et le texte, navigation par chapitre et historique.
- Conservation du zoom, de l'encodage, de la barre latérale, de la portée de recherche et de la position de lecture par livre.
- Affichage et reconnexion du fichier source dans Finder ; retirer une entrée ne supprime pas le fichier original.
- Blocage par défaut des scripts, formulaires, fenêtres contextuelles, frames imbriqués et connexions réseau des CHM.
- Prise en charge exclusive des Mac Apple Silicon, sans télémétrie, compte ni synchronisation cloud.

## Téléchargement et installation

Téléchargez `CHMReaderLight-mac-arm64.zip` depuis [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases), puis vérifiez-le avec le fichier `.zip.sha256` correspondant :

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

Les versions actuelles ne disposent pas de l'Apple notarization. Si macOS bloque le premier lancement, autorisez l'application dans **Réglages Système > Confidentialité et sécurité**. Consultez le [guide d'installation](../install-macos.md).

## Utilisation de base

1. Choisissez « Ajouter un CHM » ou faites glisser des fichiers `.chm` dans la bibliothèque.
2. Organisez les manuels en collections et filtrez-les par titre ou chemin.
3. Ouvrez un document et recherchez dans son sommaire ou son texte ; changez l'encodage si nécessaire.
4. Utilisez `Command+O` pour ajouter, `Command+F` pour rechercher et `Command+L` pour revenir à la bibliothèque.

L'application stocke uniquement les chemins sources et les préférences de lecture. Consultez [Confidentialité](../privacy.md), [Compatibilité](../compatibility.md) et [Dépannage](../troubleshooting.md).

## Configuration requise

- macOS 12 ou version ultérieure
- Mac avec Apple Silicon
- Node.js 22 ou version ultérieure pour une exécution depuis les sources

## Exécuter depuis les sources

~~~bash
npm install
npm run run
~~~

Exécutez `npm test` et `npm run check` pour vérifier le projet. Utilisez `npm run package:mac` pour empaqueter l'architecture actuelle.

## Assistance et contribution

Pour toute question, consultez [SUPPORT.md](../../SUPPORT.md) ou ouvrez une [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose). Pour la sécurité, consultez [SECURITY.md](../../SECURITY.md) ; pour contribuer, [CONTRIBUTING.md](../../CONTRIBUTING.md).

[Licence MIT](../../LICENSE) · [Mentions relatives aux logiciels tiers](../../THIRD_PARTY_NOTICES.md)
