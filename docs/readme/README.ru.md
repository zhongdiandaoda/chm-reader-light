# CHMReaderLight - программа для чтения CHM в macOS

[English](./README.en.md) | [简体中文](../../README.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Italiano](./README.it.md) | **Русский** | [العربية](./README.ar.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#системные-требования)

Лёгкая офлайн-программа для чтения CHM в macOS. Она позволяет хранить локальные руководства в библиотеке и искать по оглавлению или тексту без загрузки документов и регистрации.

**[Скачать для macOS](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[Запустить из исходного кода](#запуск-из-исходного-кода)** · **[Поставить звезду проекту](https://github.com/zhongdiandaoda/chm-reader-light)**

![Реальный экран пустой библиотеки CHMReaderLight](../assets/app-preview.png)

## Основные возможности

- Коллекции, импорт перетаскиванием, поиск по названию или пути и сохранение состояния недавнего чтения.
- Иерархическое оглавление, поиск по оглавлению и тексту, переход между главами и история навигации.
- Сохранение масштаба, кодировки, состояния боковой панели, области поиска и позиции чтения для каждой книги.
- Показ и повторная привязка исходного файла в Finder; удаление записи не удаляет исходный файл.
- По умолчанию блокируются скрипты, формы, всплывающие окна, вложенные frame и сетевые подключения из CHM.
- Поддерживаются только Mac с Apple Silicon; телеметрия, учётные записи и облачная синхронизация отсутствуют.

## Загрузка и установка

Скачайте `CHMReaderLight-mac-arm64.zip` со страницы [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) и проверьте его с помощью соответствующего файла `.zip.sha256`:

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

Текущие сборки не прошли Apple notarization. Если macOS блокирует первый запуск, разрешите открытие приложения в разделе **Системные настройки > Конфиденциальность и безопасность**. Подробнее см. в [руководстве по установке](../install-macos.md).

## Основы работы

1. Выберите «Добавить CHM» или перетащите файлы `.chm` в библиотеку.
2. Организуйте руководства в коллекции и фильтруйте их по названию или пути.
3. Откройте документ и выполните поиск по оглавлению или тексту; при неверном отображении символов смените кодировку.
4. Используйте `Command+O` для добавления файлов, `Command+F` для поиска и `Command+L` для возврата в библиотеку.

Приложение хранит только пути к исходным файлам и настройки чтения. См. также [Конфиденциальность](../privacy.md), [Совместимость](../compatibility.md) и [Устранение неполадок](../troubleshooting.md).

## Системные требования

- macOS 12 или новее
- Mac с Apple Silicon
- Node.js 22 или новее для запуска из исходного кода

## Запуск из исходного кода

~~~bash
npm install
npm run run
~~~

Для проверки выполните `npm test` и `npm run check`. Для упаковки под текущую архитектуру используйте `npm run package:mac`.

## Поддержка и участие

По вопросам использования обращайтесь к [SUPPORT.md](../../SUPPORT.md) или создайте [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose). Информация о безопасности находится в [SECURITY.md](../../SECURITY.md), а об участии в разработке — в [CONTRIBUTING.md](../../CONTRIBUTING.md).

[Лицензия MIT](../../LICENSE) · [Уведомления о сторонних компонентах](../../THIRD_PARTY_NOTICES.md)
