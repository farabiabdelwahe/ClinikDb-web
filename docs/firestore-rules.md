# Firestore Rules

Apply the rules shipped in `firebase/firestore.rules`.

Deploy:

- `npx firebase deploy --only firestore:rules`

Rule model:

- Users `{users/{uid}}` store the role (`admin` or `agent`).
- Admins: full read/write across the DB.
- Agents: read-only access to their own promo codes and commissions.
- Subscriptions: signed-in users can create; updates are made by Cloud Functions.

Adjust as your backend grows (e.g., tie agents to user accounts or use custom claims).

