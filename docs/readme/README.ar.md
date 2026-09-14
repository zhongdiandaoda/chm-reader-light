# CHMReaderLight - قارئ CHM لنظام macOS

[English](./README.en.md) | [简体中文](../../README.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Italiano](./README.it.md) | [Русский](./README.ru.md) | **العربية**

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#متطلبات-النظام)

قارئ CHM خفيف يعمل دون اتصال على macOS. يتيح تنظيم الأدلة المحلية في مكتبة والبحث في الفهرس والمحتوى، من دون رفع المستندات أو إنشاء حساب.

**[تنزيل إصدار macOS](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[التشغيل من المصدر](#التشغيل-من-المصدر)** · **[إضافة نجمة للمشروع](https://github.com/zhongdiandaoda/chm-reader-light)**

![واجهة مكتبة CHMReaderLight الفارغة الفعلية](../assets/app-preview.png)

## الميزات الرئيسية

- مجموعات، واستيراد بالسحب والإفلات، وبحث حسب العنوان أو المسار، وحفظ حالة القراءة الأخيرة.
- فهرس متداخل، وبحث في الفهرس والنص، وتنقل بين الفصول وسجل الرجوع والتقدم.
- حفظ التكبير وترميز النص والشريط الجانبي ونطاق البحث وموضع القراءة لكل كتاب.
- إظهار الملف المصدر وإعادة ربطه في Finder؛ إزالة السجل من المكتبة لا تحذف الملف الأصلي.
- حظر البرامج النصية والنماذج والنوافذ المنبثقة والإطارات المتداخلة واتصالات الشبكة داخل CHM افتراضيا.
- دعم أجهزة Mac المزودة بـ Apple Silicon فقط، بلا قياس عن بعد أو حسابات أو مزامنة سحابية.

## التنزيل والتثبيت

نزّل `CHMReaderLight-mac-arm64.zip` من [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases)، ثم تحقّق منه باستخدام ملف `.zip.sha256` المطابق:

~~~bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
~~~

الإصدارات الحالية غير موثقة عبر Apple notarization. إذا منع macOS التشغيل الأول، فاسمح بفتح التطبيق من **إعدادات النظام > الخصوصية والأمان**. راجع [دليل التثبيت](../install-macos.md) للتفاصيل.

## الاستخدام الأساسي

1. اختر «إضافة CHM» أو اسحب ملفات `.chm` إلى المكتبة.
2. نظّم الأدلة في مجموعات وصفّها حسب العنوان أو المسار.
3. افتح مستندا وابحث في فهرسه أو نصه؛ غيّر ترميز النص إذا لم تظهر الأحرف بصورة صحيحة.
4. استخدم `Command+O` لإضافة الملفات، و`Command+F` للبحث، و`Command+L` للعودة إلى المكتبة.

لا يخزن التطبيق سوى مسارات الملفات المصدر وتفضيلات القراءة. راجع [الخصوصية](../privacy.md)، و[التوافق](../compatibility.md)، و[استكشاف الأخطاء وإصلاحها](../troubleshooting.md).

## متطلبات النظام

- macOS 12 أو أحدث
- جهاز Mac مزود بـ Apple Silicon
- Node.js 22 أو أحدث للتشغيل من المصدر

## التشغيل من المصدر

~~~bash
npm install
npm run run
~~~

شغّل `npm test` و`npm run check` للتحقق من المشروع. استخدم `npm run package:mac` لإنشاء حزمة للبنية الحالية.

## الدعم والمساهمة

لأسئلة الاستخدام، راجع [SUPPORT.md](../../SUPPORT.md) أو افتح [Issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose). للمشكلات الأمنية راجع [SECURITY.md](../../SECURITY.md)، وللمساهمة راجع [CONTRIBUTING.md](../../CONTRIBUTING.md).

[رخصة MIT](../../LICENSE) · [إشعارات الجهات الخارجية](../../THIRD_PARTY_NOTICES.md)
