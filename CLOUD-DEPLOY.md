# Eric M.Sc EEIT Study Hub — Google Sync Edition

Professional mobile-friendly, flat-design M.Sc EEIT exercise workspace. Built on the existing offline learning tool, preserving its original material and browser progress.

## Five subjects
- Digital Communications
- Electrical Power Systems II
- Control Systems Theory and Design
- Microwave Engineering
- Microsystem Engineering

Includes original guided Digital Communications work, formulas, subject directories, notes, custom exercises, mastery checks, search, mobile navigation, theme toggle, PWA offline shell, and JSON backup/import. Other course question banks can be imported into `source/data/content.json`; do not mislabel placeholders as complete course solutions.

## Local preview
`node tools/build_public.cjs`, then `cd public && python3 -m http.server 8080`.

## Render deployment
- Type: Static Site
- Repository: `Eric9435/eric-msc-eeit-study-hub`
- Branch: `main`
- Build command: `node tools/build_public.cjs`
- Publish directory: `public`
- Auto-deploy: yes

A public build excludes the original exercise PDF and source question images by design. Keep authorized lecture materials private.

## Firebase setup
1. Create or select a Firebase project and register a Web App in Firebase console.
2. Enable **Authentication > Sign-in method > Google**.
3. Add the new `<name>.onrender.com` hostname to **Authentication > Settings > Authorized domains** (also add any custom domain).
4. Create Firestore database; publish the access rules in `firestore.rules` (if sharing a Firebase project, merge carefully with existing rules instead of overwriting them).
5. Add the six `EEIT_FIREBASE_*` variables from `.env.example` in Render > Environment. Redeploy.
6. Click **Google Sign-In**. After login, local progress merges with the account's Firestore document at `users/{uid}/apps/eric-eeit`.

Firebase client API keys are not admin secrets; never expose a service account private key, OAuth client secret or admin credentials in this repository or Render client assets. Sign-in requires working Firebase project configuration and rules; source code alone cannot enable it.

## Storage and migrations
Browser state remains at `localStorage['eric-eeit-exercise:v1']`. The local workflow still works offline and without an account. The cloud module merges timestamped completed/mastered/bookmarked/notes data by latest edit; custom exercises by stable ID; and refreshes after receiving a remote change. Export JSON backups before account switching. On shared devices, sign out and clear local site data yourself when finished.

## Security and rights
Only the authenticated user can read/write their own study document with `firestore.rules`. No uploaded course PDFs or question images are deployed publicly. No analytics or advertising are added.

## Limitations
Firestore document payloads are capped in this app at 850 KB; large personal documents should not be placed in progress storage. Authentication cannot work until the Firebase values, Google provider, authorized domain and Firestore rules are configured by the project owner.
