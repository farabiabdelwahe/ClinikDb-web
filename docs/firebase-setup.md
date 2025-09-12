# Firebase Setup

1) Create Firebase project
- Go to console.firebase.google.com, create a project.
- Add a Web App and copy the config.

2) Configure the Angular app
- Update `src/environments/environment.ts` with your Firebase config.
- Make sure `app.config.ts` initializes Firebase (already wired).

3) Enable products
- Authentication: enable Google (and Email/Password if you want). Add your app domains to Authorized Domains.
- Firestore: enable in Production mode.

4) Seed minimal data
- Create `users/{adminUid}` with `{ role: 'admin', email, displayName, createdAt }`.
- Optional: create some agents in `agents/{id}` with `{ displayName, email, createdAt }`.

5) Local env
- Copy `.env.example` to `.env.local` and keep Firebase keys in `environment.ts` for now. (These are client public keys.)

6) CLI and project linking
- Install Firebase CLI: `npm i -g firebase-tools`
- Login: `firebase login`
- Set default project: update `.firebaserc` with your project id.

