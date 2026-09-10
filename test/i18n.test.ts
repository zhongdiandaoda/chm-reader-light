const test = require('node:test');
const assert = require('node:assert/strict');

import {
  appMenuLabels,
  getLocaleDirection,
  getTranslationKeys,
  localeOptions,
  normalizeLocale,
  normalizeTheme,
  supportedLocales,
  translate,
} from '../src/i18n';

test('application preferences fall back to Simplified Chinese and the light theme', () => {
  assert.equal(normalizeLocale('en'), 'en');
  assert.equal(normalizeLocale('fr'), 'fr');
  assert.equal(normalizeLocale('ar'), 'ar');
  assert.equal(normalizeLocale('unknown'), 'zh-CN');
  assert.equal(normalizeLocale(null), 'zh-CN');
  assert.equal(normalizeTheme('warm'), 'warm');
  assert.equal(normalizeTheme('cool'), 'cool');
  assert.equal(normalizeTheme('dark-eye'), 'dark-eye');
  assert.equal(normalizeTheme('unknown'), 'light');
});

test('the language selector exposes all requested native language names and Arabic direction', () => {
  assert.deepEqual(localeOptions.map(({ label }) => label), [
    'English', '简体中文', '繁體中文', '日本語', '한국어', 'Español',
    'Français', 'Deutsch', 'Português', 'Italiano', 'Русский', 'العربية',
  ]);
  assert.equal(getLocaleDirection('ar'), 'rtl');
  assert.equal(getLocaleDirection('zh-CN'), 'ltr');
});

test('translations support both application languages and interpolate dynamic values', () => {
  assert.equal(translate('zh-CN', 'settings.title'), '设置');
  assert.equal(translate('en', 'settings.title'), 'Settings');
  assert.equal(translate('zh-CN', 'reader.progress', { current: 2, total: 8 }), '第 2 / 8 节');
  assert.equal(translate('en', 'reader.progress', { current: 2, total: 8 }), 'Topic 2 / 8');
});

test('all requested locales provide every application translation', () => {
  const keys = getTranslationKeys();
  assert.ok(keys.length >= 120);
  for (const locale of supportedLocales) {
    for (const key of keys) {
      assert.ok(translate(locale, key).length > 0, `${locale} is missing ${key}`);
    }
  }
});

test('all requested locales provide complete native menu labels', () => {
  const englishKeys = Object.keys(appMenuLabels.en);
  assert.ok(englishKeys.length >= 25);
  for (const locale of supportedLocales) {
    assert.deepEqual(Object.keys(appMenuLabels[locale]), englishKeys);
    for (const label of Object.values(appMenuLabels[locale])) assert.ok(label.length > 0);
  }
  assert.equal(appMenuLabels['zh-CN'].reportBug, '报告错误');
  assert.equal(appMenuLabels.ar.downloadReleases, 'تنزيل الإصدارات');
});

test('every non-English locale has localized core interface text', () => {
  for (const locale of supportedLocales.filter((item) => item !== 'en')) {
    for (const key of ['library.title', 'settings.title', 'reader.contents', 'theme.darkEye'] as const) {
      assert.notEqual(translate(locale, key), translate('en', key), `${locale} falls back to English for ${key}`);
    }
  }
  assert.equal(translate('zh-TW', 'settings.title'), '設定');
  assert.equal(translate('ja', 'library.title'), 'ライブラリ');
  assert.equal(translate('ko', 'settings.title'), '설정');
  assert.equal(translate('es', 'settings.title'), 'Ajustes');
  assert.equal(translate('fr', 'settings.title'), 'Réglages');
  assert.equal(translate('de', 'settings.title'), 'Einstellungen');
  assert.equal(translate('pt', 'settings.title'), 'Definições');
  assert.equal(translate('it', 'settings.title'), 'Impostazioni');
  assert.equal(translate('ru', 'settings.title'), 'Настройки');
  assert.equal(translate('ar', 'settings.title'), 'الإعدادات');
});
