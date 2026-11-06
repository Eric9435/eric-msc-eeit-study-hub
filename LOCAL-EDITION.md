# Earlier local-only edition documentation

The original standalone offline website is preserved in the source repository (Eric9435/Eric). This new repository hosts the cloud-enabled source without embedded question sheets.

# Eric M.Sc EEIT Exercise — Local-Only Edition

Five-subject, local-first exercise website, built as a static PWA. **No account, no Google Sign-In, no Firebase, no cloud database.**

## Run

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. You can deploy the contents of this folder as a static site, but course question images and the PDF should be hosted privately or only with authorization.

## Included

- Five EEIT subject dashboards.
- 15 Digital Communications question-bearing tutorial exercise groups; 1.2, 1.4, 2.4 are title-only in the supplied question PDF.
- 31 guided lettered subquestions covering Exercise 1.1 and 1.3 (independent study notes, not copied official solutions). Other questions are explicitly source-only.
- MathML math from authored LaTeX, with offline-friendly readable fractions, symbols and superscripts.
- Local reviewed/mastered status, bookmarks, notes, custom exercises, and light/dark appearance.
- Export/import JSON backup. **Local progress is scoped to the browser profile and site origin** and does not sync across devices.
- Installable PWA with on-demand caching of official question page images and offline shell.
- Keyboard shortcut `Ctrl+K` / `⌘K` to focus search, Escape to close a dialog.

## Privacy and recovery

All user-created data is saved under `localStorage['eric-eeit-exercise:v1']`. No remote telemetry or authentication scripts are included. Clear browser data = lose progress unless you export a JSON backup. Keep the backup safe and import it on another browser to migrate manually.

## Copyright / hosting

The private full ZIP includes source question page images and the original Digital Communications tutorial PDF. These materials are supplied for personal study; **do not distribute them publicly without permission**. If you publish the website publicly, remove `assets/questions/*` and `assets/digital-communications-tutorial-questions.pdf` first. The UI then displays a neutral source-unavailable placeholder, while your study solutions and formula bank remain accessible.

## Roadmap

Google Sign-In and cross-device sync are intentionally not implemented. They may be added as a separate future feature only after explicit request.