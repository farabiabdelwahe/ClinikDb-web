# Firestore Indexes

Indexes file: `firebase/firestore.indexes.json`

Deploy:

- `npx firebase deploy --only firestore:indexes`

Included indexes:

- `promocodes` by `(assigned_agent_id, status)`
- `subscriptions` by `(promocode_id, status)`
- `agent_promocode_commissions` by `(agent_id, commission_status)`

Add more as you add filters/sorts in the UI.

