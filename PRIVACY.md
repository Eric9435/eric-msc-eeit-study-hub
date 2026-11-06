# Privacy notice — Eric M.Sc EEIT Study Hub

**Without Google Sign-In:** Your notes, bookmarked exercise parts, reviewed/mastered checkmarks, custom exercises, preferences and recent history remain in this browser's localStorage key `eric-eeit-exercise:v1`. Nothing is uploaded to a study database by the app.

**After Google Sign-In:** Firebase Authentication handles your Google account session. The app synchronizes the same study progress and your own notes/custom exercises to Cloud Firestore in `users/{firebaseUserId}/apps/eric-eeit`. Access is restricted by the repository's Firestore rules to the authenticated owner. This is not end-to-end encryption. Firebase and Render may process IP addresses and technical service logs according to their service terms.

You may sign out from the account menu. Signing out does not erase the browser's local study data or the Firestore document. For shared devices, export a backup if needed and explicitly clear this site's browser storage. To delete cloud data, remove your study document from the Firebase project or provide a deletion workflow in a later product update. Do not enter personal secrets into study notes.

Import/export JSON files remain local to the user unless they manually share them. We do not include analytics, advertisements, or tracking pixels. Original exercise PDFs/question-sheet images are excluded from the public Render build; they should remain in private authorized study storage.

Contact the site owner for privacy and account-related questions.