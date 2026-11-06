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

**Professional project integration (6 November 2026):** The source catalog retains its original 82 entries. Runtime now merges independent reconstructions and **23 recovered, recalculated Micro TUHH project practice entries** into **105 visible exercise sets, 316 guided subquestions and 69 formula references**. Four source-identified Microwave tasks (3.3, 3.4, 5.2, 5.3) now have fresh working. **Eight source-only entries** remain because the full question/diagram/numerical givens are not available. Recorded solutions and regression tests do not imply an exhaustive mathematical audit of every older calculation or official exam certification.

## Project practice recovered from earlier ChatGPT work — 6 November 2026

The `source/data/project-practice.json` archive contains independently recomputed MEMS exercises **1–16, 18, 20, 25–27, 29–30**. Their previously assigned numbers are retained, but they are *not* claimed to be official TUHH exercises. Original question data for the remaining numbered project exercises was not reliably recoverable, so gaps are disclosed instead of invented. A prior comb-drive example gave 4.427 pF; the stated N=50, t=10 μm, L=100 μm, g=2 μm values recompute to **0.4427 pF**.

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

## Inline complete solution view (6 November 2026)

The exercise page displays all available subquestions (a), (b), (c), etc. in document order and retains the original source reference. Symbolic formulas **and** individually annotated substitutions/checks are now rendered together, with **separate accessible Myanmar Method and Why dialogs** for on-screen learning. A4 print includes complete explanations inline. Each part has its own final answer, source/verification note and local review tools. Retired popup scripts are still excluded; the explanations use the current app's native dialog. Course PDFs stay private and missing problems are never filled with fabricated official questions.

## Live-site verification

`node tools/live_check.mjs` performs HTTP checks against the deployed Render site: HTML, CSS/JavaScript assets, 82-entry content JSON, actual image headers and Firebase client configuration presence (never logs the config values). `.github/workflows/eeit-live-check.yml` runs this check when `main` changes. The app's original course PDFs and privately provided question scans remain excluded from deployment.

The website loads `inline-solutions.css` and the revised `app.js` only for worked-solution presentation; the old `enhancements.js` and `reason-ui.js` implementations are not loaded or published.

## Independent exercise expansion — 6 November 2026

The additive `source/data/verified-expansion.json` supplies **21 independently derived exercise overrides** (143 fully written subparts) covering all five subjects. The app merges these by exercise ID with the original content at runtime; the existing exercise IDs, personal progress, references, and optional Firebase/cloud wiring remain unchanged. The PWA caches this data for offline sessions.

Verified expansion coverage: Digital Communications OFDM 4.1 (a–j), 5G NR 4.2 (a–f), LTE 4.3 (a–e), CDMA 5.1 (a–g), Equalization 3.1 (a–k), MAP/ML 3.2 (a–k), Viterbi 3.3 (a–h), Linear Modulation 2.1 (a–o), QPSK/16-QAM Error Probability 2.2 (a–g), Receiver Phase Offset 2.3 (a–e), DAPSK 2.5 (a–e), JANUS 2.6 (a–m) and OQPSK/MSK 2.7 (a–i); Electrical Power Systems II symbolic PST, per-unit, three-bus Y-bus, and Newton–Raphson Jacobian worked examples; Control Systems I.2 state-space and system tuples; Microwave Engineering 1.2 full link budget (a–c) and 1.3 coax fields (a–g); Microsystem Engineering new independent mass–spring practice (a–c). Numerical examples introduced for teaching are clearly labelled illustrative and are not claimed to be professor originals.

**Important:** Existing source-only exercises and legacy unreviewed subparts are deliberately not relabelled solved. For the reviewed additions, each revised subpart contains study calculation expressions, a reason, the solving method, and an inline final-answer section. Several original tutorial questions require private figures or additional source information; they have not been invented.

Run `node tools/smoke_public.cjs` for consistency checks, build and security/copyright safeguards.

## Solution-audit status

The available course exercise library and independently written practice do **not** establish that all official problems have complete validated worked answers. This UI change preserves existing course exercise IDs and sync storage without adding invented givens or figures. All recorded solutions are displayed inline; missing written methods/final answers are visibly labelled pending review. Before marking the full bank mathematically complete, compare every numerical result and assumption against the original private question sheet and correct any legacy mathematical errors.

### Latest coverage QA

Across the original 82 study-exercise entries, **69** now have guided worked parts with **277** individual subparts. **13** remain source-only (including 3 genuine heading-only placeholders in the original Digital Communications tutorial, which cannot be independently solved without a question). Original legacy worked parts outside the 21 reviewed expansion entries are not claimed to have undergone a comprehensive independent source audit.

## A4 continuous white-paper edition (6 November 2026)

Exercise worked pages are now centered white A4 documents on gray workspaces, including dark-theme sessions. The **Overall Solution** heading contains every available subquestion in order with its source question, method, displayed derivation, Myanmar reasoning, and final result. It is not a short recap. No popup explanation buttons appear. Missing derivations and official givens are explicitly flagged. Printing uses A4 pagination across long worked solutions; mobile uses a full-width white reading canvas. Changes are in `source/app.js`, `source/a4-paper.css`, and the PWA cache. Progress, bookmarks, notes and cloud account paths are unchanged.

## Exam preparation and source provenance — 6 November 2026

The website currently contains five subjects, 82 exercise entries and 69 formula references. The four-layer exercise bank uses `source/data/content.json`, `verified-expansion.json`, `original-practice-reworked.json`, and `source-backed-derivations.json`. The current merged release contains 280 documented subquestions, but 12 source-only entries still have no complete worked solutions. The presence of a method and final answer **does not certify correctness** or completeness of the official examination syllabus.

- Original user/workspace practice: 21 exercise sets, 63 subquestions reformatted and re-derived as Given → Governing Formula → Substitution → Independent Check.
- Source-referenced reconstructions: 21 Digital Communications 1.1 parts, 10 Digital Communications 1.3 parts, and 3 Microwave 2.5 matching-network subparts under an explicit series-capacitor assumption (34 subparts).
- Independent practice is not mislabeled as official TUHH problem sheets. Original instructor solutions are used only as private references and are not reproduced as public PDF or scans.
- Private Original Documents viewer: use the Source tab to attach your own legally obtained course question and sample-solution PDF per subject. Original PDFs are stored in this browser's IndexedDB only. No PDF file is uploaded to Render, GitHub or Firebase. This storage is separate from synced Google-account study progress.
- Exam preparation audit on Dashboard distinguishes documented working from source-only entries and explicitly says that exam readiness has not been certified. Review numerical values and unit conventions against official materials before examinations.
- Numerical regression test: `node tools/engineering_regression.cjs`. Structural/build test: `node tools/smoke_public.cjs`. Live HTTP test: `node tools/live_check.mjs`.

## Dedicated PDF Document Library (6 November 2026)

- Navigation now contains **PDF Document Library**, a searchable, filterable catalog across all five EEIT subjects, with individual source records and local PDF Attach / Read / Replace / Remove controls. The catalog is metadata only; it does not contain or publish the source PDFs.
- `source/data/pdf-catalog.json` holds 92 unique PDF catalog records, drawn from the TUHH 81-PDF source-audit inventory plus named PDFs found in the user's ChatGPT Library. Catalog entries marked **Archived PDF reference** are inventory references and do **not** certify that the raw bytes are currently available through ChatGPT Library. **Named Library source** entries correspond to identified filenames, but still need a local copy attached.
- The **Original questions** tab of each exercise shows the most relevant named course PDF records for its subject and links to the full catalog. The original instructor-owned PDFs and images are deliberately excluded from the static public build.
- The PDF reader stores files in the browser's IndexedDB (`catalog:<id>`), not in GitHub, Render, or Firebase. Only the user opening the local page can select an actual file; this integration cannot copy PDF bytes from ChatGPT Library automatically, because raw-byte materialization is not authorized for these Project files. This is important: a catalog entry is never labelled as an actual attached PDF until its data exists in IndexedDB.
- **Fast onboarding:** choose **Choose PDF files** to select multiple PDFs at once; exact filenames are matched to individual records. Unmatched or ambiguous filenames are skipped. Or open each document entry and select **Attach PDF** individually. File content is verified for a `%PDF-` signature and limited to 70 MB per document.
- Browser-local PDFs do not synchronize across devices and can disappear when browser/site data are cleared. A storage backup of the PDF files themselves is not included in the JSON study-progress export.
- Source solution entries and your independently calculated A4 paper solutions are separately labelled. The 280 guided subquestions remain distinct from raw official PDF sample solutions. A complete mathematical audit of all official problems has not been certified.


### One ZIP archive import (2026-11-06)

The **PDF Document Library** now accepts a single `.zip` containing subject folders/PDF files (in addition to selecting multiple PDFs). For each ZIP member, it uses its full normalized source path first, and a unique filename fallback. It reads and validates ZIP directory records, extracts supported stored/deflated PDFs in the browser, checks the `%PDF-` header, and writes matched files to the user's device-local IndexedDB. It skips non-matching/ambiguous names and enforces per-file and total extraction caps. It does **not** upload PDFs to the repository, Render, or Firebase. No file from ChatGPT Library has been silently copied or attached: the connector permits text/metadata access but not raw-byte materialization for the selected Project files. A browser-selected ZIP/PDF is still necessary to import original bytes.

Run `node tools/zip_import_check.cjs` for synthetic archive regression tests; no course material is included in the test fixture.

## Private original PDF integration — November 6, 2026

**Status: 123/123 original PDFs successfully uploaded to owner-restricted Google Drive.** These are the PDF files actually included in the user-supplied `Eric_MSc_EEIT_5_Subjects_COMPLETE_Master_UPDATED_2026-11-06.zip`. They include Digital Communications (56), EPS II (17), Control Systems (17), Microwave Engineering (25), Microsystem Engineering (6), and Shared Study Handbooks (2). The original bytes are stored in private Drive and are not shipped as public web assets or placed in this GitHub repository.

The website `PDF Document Library` now has 123 actual private-drive PDF records, plus 10 metadata-only references that have not been imported. Each uploaded original can be opened in a Drive-backed viewer directly on the site, with a fallback to the authenticated Google Drive file. The **Source** tab of an exercise also surfaces relevant original questions, worked solutions, past exams and course references. Previously indexed PDF question/answer page references remain visible, where available.

The Google Drive file is **not public**: sample metadata readbacks returned `shared=false` and an owner-only permission. This private Drive account must be signed in separately; Firebase Google Sign-In to the study hub does not automatically grant access to Drive data or sharing permissions. Inline Drive previews can be restricted by third-party cookies on some browsers; selecting **Open original PDF in Google Drive** is the supported fallback.

All 123 Google Drive uploads returned successful write results. Original source filenames are preserved in the private Drive folder hierarchy under `Eric MSc EEIT - Private Course PDFs`; the website's catalog has source paths and Drive file IDs for navigation. The separate `source/data/private-drive-pdfs.json` mirrors the upload inventory, not the PDF bytes. These IDs alone do not grant file access. Google Drive sharing must remain owner-only until an explicit authorized change.

**Updated workflow:** It is no longer necessary to import the user-provided ZIP to open the 123 Drive-backed PDFs. The ZIP importer remains available for offline, browser-local copies and other previously uncatalogued documents. Older README sections describing metadata-only or manually attached PDFs were the pre-integration state.

## Source-to-exercise completeness audit — corrected 6 November 2026

Uploading all 123 user-provided PDFs to owner-only Google Drive was successful, but **upload count alone was not exercise completeness**. A subsequent audit discovered that the prior 49 exercise/page references were attached to metadata-only *compiled* PDF records, not the actual uploaded Drive PDFs, so none of 82 exercise entries had a working exact original page pair at that point. This is now corrected:

- **42 / 82 exercises** are linked to actual uploaded question AND solution PDFs, with 84 verified page references, based on real Problem/Exercise/Task headings. These are 18 Digital Communications, 6 Control Systems, and 18 Microwave Engineering source exercises.
- **22 / 82 exercises** have only **related lecture references**, including 12 EPS II lecture-derived examples and 10 independent Microsystem practice items. These are explicitly *not* original tutorial/official-solution matches.
- **18 / 82 exercises** are independent practice without a direct source match in the uploaded PDFs.
- **12 exercise sets** (3 Digital, 5 EPS II, 4 Microwave) still lack a complete authored worked solution despite some being covered by an official-solution PDF.
- The PDF Library lists **123 Drive-backed course PDFs plus 10 metadata-only compilation records**. The 123 PDFs include past papers, lecture material, labs, and independent notes; they are not 123 unique official exercise sheets. No direct official exercise sheets for the EPS II or Microsystem course were confirmed in this ZIP.

The Source tab now prioritizes a verified original question and sample-solution page pair, marks lecture-only references separately, and warns when authored working is incomplete. A coverage overview is visible on the PDF Library page, rather than equating file uploads with exam readiness. Original PDF bytes remain owner-private in Google Drive and are not included in the public repository. Direct page navigation inside Google's embedded PDF viewer depends on the browser; the page number shown on the source record is the authoritative reference.
