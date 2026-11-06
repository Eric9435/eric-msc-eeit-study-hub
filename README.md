# Eric M.Sc EEIT — Engineering Study Hub

A five-subject, responsive, installable study workspace for M.Sc Electrical Engineering and Information Technology, Winter Semester 2026/27.

**Git branch:** `main`. Migrated from the existing Eric offline repository. The public app lives in `source/` and private source question images/PDFs are excluded.

## Subjects and teaching content

| Subject | Practice content |
|---|---|
| Digital Communications | 15 source exercise sets; independent worked parts for selected sets |
| Electrical Power Systems II | 4 new original practice sets × 3 worked parts |
| Control Systems Theory and Design | 4 new original practice sets × 3 worked parts |
| Microwave Engineering | 4 new original practice sets × 3 worked parts |
| Microsystem Engineering | 4 new original practice sets × 3 worked parts |

**Integrated content release:** 82 exercise entries, 139 guided subquestions and 69 formula references. The 16 original practice sets and all five-subject branding have been preserved. 30 course-referenced entries are still source-only; some other worked sets have only partial subpart coverage. Newer calculations were derived independently, but legacy solutions have not all been comprehensively reaudited. This is not a claim that every official tutorial is fully solved.

## Core capabilities

- Five interactive subjects, exercise explorer and chapter grouping
- Myanmar explanations, calculations, source context, self-check and mastery tracking
- Formula bank, global search and subject filters
- Note editor, bookmark system and custom exercise editor
- JSON export/restore, responsive navigation and light/dark styles without gradients
- Local-first study progress, installable offline PWA shell
- Optional Firebase Google Sign-In and private, per-account Firestore sync with timestamped merges and transactional writes
- Accessible account menu (Sync now / Sign out)

## Run locally

```bash
node tools/build_public.cjs
cd public
python3 -m http.server 8080
```

Open `http://localhost:8080`. See `CLOUD-DEPLOY.md` for Render, Firebase Web App variables, Authorized Domains and Firestore rules. The app stays fully usable locally without Firebase.

## Render build configuration

- Git repo: `https://github.com/Eric9435/eric-msc-eeit-study-hub`
- Branch: `main`
- Build command: `node tools/build_public.cjs`
- Publish directory: `public`
- Auto-deploy enabled

Render workspace service availability is separate from code readiness. If the workspace is full, release a slot or choose a different workspace before creating a new static site.

## Content rights and safety

The build excludes any `source/assets/questions/` media and all PDF files. Do not publicly host lecture slides or official exercise sheets without the relevant rights. Firestore rules in `firestore.rules` are *required* for private cloud progress. Never commit Firebase Admin keys or service-account secrets.

## QA

Run `node tools/smoke_public.cjs`. Study data remains compatible with the previous `eric-eeit-exercise:v1` browser storage key. 

## Visual identity

The generated Eric M.Sc EEIT Study Hub logo is included in `source/assets/eeit-study-hub-logo.webp` (optimized for the web), alongside `source/brand-ui.css` for flat, responsive branding. The original logo design is represented in the website sidebar, mobile header and dashboard hero.

## Why / Method / Final Answer dialogs (v1.3)

Every worked part offers dedicated accessible popups for the Myanmar method reason, calculation method and final answer. Content source notes distinguish original practice, independent study derivations and source-only entries. Original course PDFs and instructor-owned question scans remain excluded from the public build. Existing logo, Firebase integration and local storage keys are unchanged.

## Live-site verification

`node tools/live_check.mjs` performs HTTP checks against the deployed Render site: HTML, CSS/JavaScript assets, 82-entry content JSON, actual image headers and Firebase client configuration presence (never logs the config values). `.github/workflows/eeit-live-check.yml` runs this check when `main` changes. The app's original course PDFs and privately provided question scans remain excluded from deployment.

We intentionally load only `enhancements.js` for the three explanation dialogs. The older `reason-ui.js` remains in the repository for historical reference, but is no longer loaded; running both scripts could overwrite each other's exercise rationale controls.

## Independent exercise expansion — 6 November 2026

The additive `source/data/verified-expansion.json` supplies **9 reviewed exercise overrides** (41 fully written subparts) covering all five subjects. The app merges these by exercise ID with the original content at runtime; the existing exercise IDs, personal progress, references, and optional Firebase/cloud wiring remain unchanged. The PWA caches this data for offline sessions.

Verified expansion coverage: Digital Communications OFDM 4.1 (a–j); Electrical Power Systems II symbolic PST, per-unit, three-bus Y-bus, and Newton–Raphson Jacobian worked examples; Control Systems I.2 state-space and system tuples; Microwave Engineering 1.2 full link budget (a–c) and 1.3 coax fields (a–g); Microsystem Engineering new independent mass–spring practice (a–c). Numerical examples introduced for teaching are clearly labelled illustrative and are not claimed to be professor originals.

**Important:** Existing source-only exercises and legacy unreviewed subparts are deliberately not relabelled solved. For the reviewed additions, each subpart contains independent calculation expressions, why, solving method, and final-answer popup content. Several original tutorial questions require private figures or additional source information; they have not been invented.

Run `node tools/smoke_public.cjs` for consistency checks, build and security/copyright safeguards.
