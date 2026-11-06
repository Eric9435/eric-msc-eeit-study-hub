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

**Total:** 31 exercise sets and 34 formula references. New non-Digital problems are original learning examples, **not official tutorial exercises or professor-provided solutions**. The Digital library includes source-only entries whose independent solutions are not yet present.

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
