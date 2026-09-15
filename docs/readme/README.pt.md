# CHMReaderLight - Leitor CHM para macOS

[English](./README.en.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | **Português** | [Italiano](./README.it.md) | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#requisitos)

Um leitor CHM leve e offline para macOS. Organize manuais locais em uma biblioteca e pesquise no índice ou no conteúdo, sem enviar documentos nem criar uma conta.

**[Baixar para macOS](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[Executar a partir do código-fonte](#executar-a-partir-do-código-fonte)** · **[Dar uma estrela ao projeto](https://github.com/zhongdiandaoda/chm-reader-light)**

![Biblioteca vazia real do CHMReaderLight](../assets/app-preview.png)

## Principais recursos

- Coleções, importação por arrastar e soltar, pesquisa por título ou caminho e estado de leitura recente.
- Índice hierárquico, pesquisa no índice e no texto, navegação entre capítulos e histórico.
- Salva zoom, codificação de texto, barra lateral, escopo de pesquisa e posição de leitura de cada livro.
- Mostra e permite vincular novamente o arquivo de origem no Finder; remover um item não exclui o arquivo original.
- Bloqueia por padrão scripts, formulários, pop-ups, frames aninhados e conexões de rede do CHM.
- Compatível exclusivamente com Macs Apple Silicon, sem telemetria, contas ou sincronização em nuvem.

## Download e instalação

Baixe `CHMReaderLight-mac-arm64.zip` em [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) e verifique-o com o arquivo `.zip.sha256` correspondente:

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

As versões atuais não têm Apple notarization. Se o macOS bloquear a primeira execução, permita o aplicativo em **Ajustes do Sistema > Privacidade e Segurança**. Consulte o [guia de instalação](../install-macos.md).

## Uso básico

1. Selecione "Adicionar CHM" ou arraste arquivos `.chm` para a biblioteca.
2. Organize os manuais em coleções e filtre por título ou caminho.
3. Abra um documento e pesquise no índice ou no texto; altere a codificação se os caracteres não forem exibidos corretamente.
4. Use `Command+O` para adicionar arquivos, `Command+F` para pesquisar e `Command+L` para voltar à biblioteca.

O aplicativo armazena apenas os caminhos de origem e as preferências de leitura. Consulte [Privacidade](../privacy.md), [Compatibilidade](../compatibility.md) e [Solução de problemas](../troubleshooting.md).

## Requisitos

- macOS 12 ou posterior
- Mac com Apple Silicon
- Node.js 22 ou posterior para executar a partir do código-fonte

## Executar a partir do código-fonte

~~~bash
npm install
npm run run
~~~

Execute `npm test` e `npm run check` para verificar o projeto. Use `npm run package:mac` para empacotar a arquitetura atual.

## Suporte e contribuição

Para dúvidas, consulte [SUPPORT.md](../../SUPPORT.md) ou abra uma [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose). Para segurança, consulte [SECURITY.md](../../SECURITY.md); para contribuir, [CONTRIBUTING.md](../../CONTRIBUTING.md).

[Licença MIT](../../LICENSE) · [Avisos de terceiros](../../THIRD_PARTY_NOTICES.md)
