# Accessibility Guide

This guide summarizes CHMReaderLight's current keyboard, assistive technology, and appearance expectations so users can evaluate the app before adopting it.

## Current Support

- Keyboard-first library and reader workflows are supported through native macOS menus and documented shortcuts.
- Visible focus states help track keyboard movement through library cards, toolbar controls, dialogs, and menus.
- Status changes such as library counts, empty-search results, topic progress, and copy actions use polite announcements.
- Reader zoom and text encoding preferences persist between launches, which can make repeated CHM reading more comfortable.

## Known Limits

- CHMReaderLight currently uses a light appearance.
- Dark mode and high-contrast theme switches are not available yet.
- VoiceOver coverage is expected to improve through real reports rather than broad claims.
- CHM-authored content can vary widely, so some extracted pages may have accessibility issues inherited from the original help file markup.

## Report an Accessibility Gap

Use the accessibility issue template when keyboard navigation, focus order, VoiceOver output, color contrast, or appearance behavior makes CHM reading harder.

Include:

- The affected workflow, such as library management, reader navigation, search, or a specific toolbar control.
- The input method or assistive technology you used.
- Your macOS appearance setting.
- The smallest steps that reproduce the issue.
- The expected accessible behavior.
- **Help > Copy Diagnostic Info** output.
- A safe screenshot or recording if it helps explain the issue.

Do not include private CHM content, sensitive file paths, or confidential screenshots in a public report.
