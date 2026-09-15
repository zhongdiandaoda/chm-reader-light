# CHMReaderLight - Lector CHM para macOS

[English](./README.en.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | **Español** | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Italiano](./README.it.md) | [Русский](./README.ru.md) | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#requisitos)

Un lector CHM ligero y sin conexión para macOS. Organiza manuales locales en una biblioteca y busca en sus índices y contenidos, sin subir documentos ni crear una cuenta.

**[Descargar para macOS](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[Ejecutar desde el código fuente](#ejecutar-desde-el-código-fuente)** · **[Dar una estrella al proyecto](https://github.com/zhongdiandaoda/chm-reader-light)**

![Biblioteca vacía real de CHMReaderLight](../assets/app-preview.png)

## Funciones principales

- Colecciones, importación mediante arrastrar y soltar, búsqueda por título o ruta y estado de lectura reciente.
- Índice jerárquico, búsqueda en el índice y el texto, navegación por capítulos e historial.
- Conserva el zoom, la codificación, la barra lateral, el ámbito de búsqueda y la posición de lectura de cada libro.
- Permite mostrar y volver a vincular el archivo original en Finder; quitar un registro no elimina el archivo.
- Bloquea de forma predeterminada scripts, formularios, ventanas emergentes, frames anidados y conexiones de red del CHM.
- Compatible exclusivamente con Mac Apple Silicon, sin telemetría, cuentas ni sincronización en la nube.

## Descarga e instalación

Descarga `CHMReaderLight-mac-arm64.zip` desde [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) y verifícalo con el archivo `.zip.sha256` correspondiente:

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

Las compilaciones actuales no tienen Apple notarization. Si macOS bloquea el primer inicio, permite la aplicación en **Ajustes del Sistema > Privacidad y seguridad**. Consulta la [guía de instalación](../install-macos.md).

## Uso básico

1. Selecciona «Añadir CHM» o arrastra archivos `.chm` a la biblioteca.
2. Organiza los manuales en colecciones y filtra por título o ruta.
3. Abre un documento y busca en su índice o texto; cambia la codificación si los caracteres no se muestran bien.
4. Usa `Command+O` para añadir archivos, `Command+F` para buscar y `Command+L` para volver a la biblioteca.

La aplicación solo guarda las rutas de origen y las preferencias de lectura. Consulta [Privacidad](../privacy.md), [Compatibilidad](../compatibility.md) y [Solución de problemas](../troubleshooting.md).

## Requisitos

- macOS 12 o posterior
- Mac con Apple Silicon
- Node.js 22 o posterior para ejecutar desde el código fuente

## Ejecutar desde el código fuente

~~~bash
npm install
npm run run
~~~

Ejecuta `npm test` y `npm run check` para verificar el proyecto. Usa `npm run package:mac` para empaquetar la arquitectura actual.

## Soporte y contribuciones

Para preguntas de uso, consulta [SUPPORT.md](../../SUPPORT.md) o abre un [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose). Para seguridad, consulta [SECURITY.md](../../SECURITY.md); para contribuir, [CONTRIBUTING.md](../../CONTRIBUTING.md).

[Licencia MIT](../../LICENSE) · [Avisos de terceros](../../THIRD_PARTY_NOTICES.md)
