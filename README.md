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

### Reasoning popups

Each worked exercise contains a keyboard-accessible **Why this method?** button. It opens a responsive modal displaying the independent Myanmar reasoning for that specific exercise part. Escape, close button and tapping outside dismiss it; focus returns to the original button. No third-party library required.

## Why / Method / Final Answer dialogs (v1.3)

Every worked part offers dedicated accessible popups for the Myanmar method reason, calculation method and final answer. Content source notes distinguish original practice, independent study derivations and source-only entries. Original course PDFs and instructor-owned question scans remain excluded from the public build. Existing logo, Firebase integration and local storage keys are unchanged.
