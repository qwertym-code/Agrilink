# Agrilink — Authentication Foundation

**Date:** 2026-08-11
**Status:** Approved
**Scope:** Authentication slice only. Marketplace features (listings, cart, orders) are out of scope and will get their own specs.

## Purpose

Agrilink is a farmers marketplace connecting **consumers** (buyers) with **retailers** (farmers/sellers).
This spec covers the foundation both roles depend on: account creation, login, session handling, and
role-based access control. Nothing can be built on top of it until this is solid, so it ships first
and ships complete.

## Constraints

- **Stack is fixed:** JavaScript, Bootstrap, React.js, Node.js, Express.js, MongoDB, Mongoose.
  No TypeScript, no alternate CSS frameworks, no ORMs other than Mongoose.
- **Database is MongoDB Atlas.** No MongoDB is installed locally; the app connects over a
  `MONGO_URI` supplied through environment variables.
- **Sessions are JWT-based.** No server-side session store.

## Architecture

Two independent packages at the repo root, each with its own `package.json` and dependency tree.
They communicate only over HTTP/JSON, so either can be run, restarted, or deployed alone.

```
Agrilink/
├── server/                     Express API, port 5000
│   ├── .env                    git-ignored, holds real secrets
│   ├── .env.example            committed template
│   └── src/
│       ├── config/db.js              Mongoose connection
│       ├── models/User.js            user schema, hooks, instance methods
│       ├── controllers/authController.js
│       ├── routes/authRoutes.js
│       ├── middleware/auth.js        protect, requireRole
│       ├── middleware/errorHandler.js
│       ├── utils/normalizePhone.js
│       ├── app.js                    express wiring, no side effects
│       └── server.js                 connect DB, then listen
└── client/                     React + Vite, port 5173
    └── src/
        ├── api/axios.js              base URL + Authorization interceptor
        ├── context/AuthContext.jsx   single source of truth for user + token
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── ConsumerDashboard.jsx
        │   └── RetailerDashboard.jsx
        ├── App.jsx                   routing table
        └── main.jsx                  entry, imports Bootstrap CSS
```

`app.js` builds and exports the Express app without listening or connecting to anything.
`server.js` owns the side effects. This split keeps the app importable for testing later.

Each file holds one responsibility. As marketplace features arrive they add sibling files
(`models/Product.js`, `controllers/productController.js`) rather than growing existing ones.

## Data model

A single `User` collection, not separate `Consumer` and `Retailer` collections.

| Field | Type | Rules |
|---|---|---|
| `name` | String | required, trimmed |
| `email` | String | required, unique, lowercased, trimmed, format-validated |
| `phone` | String | required, unique, stored as bare 10 digits |
| `password` | String | required, min 6 chars, bcrypt-hashed, `select: false` |
| `role` | String | required, enum `['consumer', 'retailer']` |
| `farmName` | String | required **only when** `role === 'retailer'` |
| `location` | String | required **only when** `role === 'retailer'` |
| `createdAt` / `updatedAt` | Date | via `timestamps: true` |

**Why one collection:** login must resolve an identifier to exactly one account with a single
query. Two collections would require querying both on every login attempt, and would make the
same email or phone in both collections a genuine ambiguity with no correct resolution. A `role`
field keeps lookup trivial and gives `requireRole('retailer')` something to check.

**Why `password` is `select: false`:** every incidental `User.find()` anywhere in the codebase
is then safe by default. The login controller is the one place that opts back in via
`.select('+password')`, so leaking a hash requires deliberate action rather than forgetfulness.

**Why `farmName`/`location` are conditionally required:** consumers have no farm. Making the
fields unconditionally required would force meaningless placeholder data; making them optional
would let a retailer register with no shop identity at all. A function-form `required` validator
that reads `this.role` expresses the real rule.

### Schema hooks

- **`pre('validate')` — phone normalization.** Strips all non-digits, then removes a leading
  `91` (country code) or `0` (trunk prefix), leaving bare 10 digits. Runs before validation so
  the uniqueness index and the length validator both see the canonical form.
- **`pre('save')` — password hashing.** Guarded by `isModified('password')` so profile updates
  don't re-hash an already-hashed value. bcrypt with 10 salt rounds.
- **`comparePassword(candidate)` instance method** — wraps `bcrypt.compare`, so no controller
  ever touches bcrypt directly.

Putting normalization and hashing in hooks means the rules live with the model. A future
controller, seed script, or admin tool cannot bypass them.

### Phone format

Indian 10-digit numbers. An optional `+91` or leading `0` is accepted at input and stripped.
`+91 98765 43210`, `09876543210`, and `9876543210` all normalize to `9876543210` and resolve to
the same account.

This is a deliberate narrowing. Normalizing at both write and read time is what makes
"register one way, log in another way" work; without it a user hits `Invalid credentials` with
no way to understand why. Switching to international E.164 later is a validator change, and is
much cheaper to do before the collection holds data.

## API

Base path `/api/auth`. All responses are JSON.

| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| POST | `/register` | — | `{ name, email, phone, password, role, farmName?, location? }` | `201 { user, token }` |
| POST | `/login` | — | `{ identifier, password }` | `200 { user, token }` |
| GET | `/me` | Bearer | — | `200 { user }` |

A `GET /api/health` route returns `{ status: 'ok' }` for connectivity checks.

### Login: one identifier field

The client sends a single `identifier`. The controller discriminates on `@`:

```js
const query = identifier.includes('@')
  ? { email: identifier.toLowerCase().trim() }
  : { phone: normalizePhone(identifier) };
```

**Why branch instead of `$or: [{ email }, { phone }]`:** the branch hits one index directly
rather than making Mongo evaluate both paths, and it removes any chance of a value matching the
wrong field. A valid phone number cannot contain `@`, so the test is sufficient.

### Failure responses

- **Login failures return one generic message** — `Invalid email/phone or password` — with status
  `401`, identically for an unknown identifier and a wrong password. Distinguishing them would
  turn the endpoint into an oracle for checking which emails and phone numbers hold accounts.
- **Registration conflicts are specific** — `409` naming the colliding field, either
  `An account with this email already exists` or `An account with this phone number already exists`.
  Registration inherently reveals the conflict (it cannot proceed), so vagueness here costs
  usability and buys no privacy.

### Token

`jsonwebtoken`, payload `{ id, role }`, signed with `JWT_SECRET`, 7-day expiry.
`role` rides in the payload so `requireRole` can reject without a database round-trip.
The user object returned alongside the token never includes the password hash.

### Storage: `localStorage` + `Authorization: Bearer`

**Accepted tradeoff.** An httpOnly cookie resists XSS better, but requires CORS credentials,
`sameSite` configuration, and CSRF protection, and it complicates the Vite dev proxy. The Bearer
pattern is the conventional MERN approach and keeps the client simple. The exposure is that any
XSS on the client can read the token — the mitigation is that React escapes rendered content by
default and the app introduces no `dangerouslySetInnerHTML`.

## Middleware

- **`protect`** — reads `Authorization: Bearer <token>`, verifies it, loads the user, attaches
  `req.user`. Rejects `401` on a missing, malformed, expired, or invalid token, or when the
  token is valid but the user no longer exists.
- **`requireRole(...roles)`** — runs after `protect`, returns `403` if `req.user.role` is not in
  the allowed list. Composable: `router.get('/x', protect, requireRole('retailer'), handler)`.
- **`errorHandler`** — the single place that turns thrown errors into responses:
  Mongoose `ValidationError` → `400` with per-field messages; duplicate key (`code 11000`) → `409`
  naming the field; `JsonWebTokenError`/`TokenExpiredError` → `401`; anything else → `500` with a
  generic message, with the stack logged server-side and never sent to the client.

Controllers throw and never format error responses themselves, so error shape stays consistent
across every endpoint.

## Client

**`AuthContext`** exposes `{ user, token, loading, login, register, logout }` and is the only
place that touches `localStorage`. On mount it rehydrates the token and calls `/me` to confirm
the session is still valid — a token can be expired or belong to a deleted user, so trusting
cached user data would show a logged-in UI for a dead session. `loading` covers this check so
`ProtectedRoute` doesn't redirect before the answer arrives.

**`api/axios.js`** attaches the `Authorization` header from an interceptor, so no component
assembles auth headers by hand.

**`ProtectedRoute`** takes an optional `role` prop. No token → redirect to `/login`. Wrong role →
redirect to that user's own dashboard. Otherwise render children.

**Routing**

| Path | Guard |
|---|---|
| `/` | public |
| `/login`, `/register` | public; redirect to the role dashboard if already signed in |
| `/consumer` | `protect` + role `consumer` |
| `/retailer` | `protect` + role `retailer` |

**Pages.** One `Login` page serves both roles — a single Bootstrap input labeled
**"Email or phone number"** with `autoComplete="username"`. The role comes from the account,
not from the login form, so there is no role selector at login and no way to pick the wrong one.

One `Register` page serves both roles, with a Bootstrap button-group toggle for
consumer/retailer that conditionally reveals the farm-name and location fields. After successful
auth, both pages redirect by `user.role`.

Dashboards are intentionally stubs in this slice — enough to prove the guard works and to give
marketplace features a home to land in.

Styling is Bootstrap 5 utility and component classes applied via `className`, with the CSS
imported once in `main.jsx`.

## Configuration

`server/.env` is git-ignored. `server/.env.example` is committed:

```
PORT=5000
MONGO_URI=your-atlas-connection-string
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

`server.js` fails fast with a clear message if `MONGO_URI` or `JWT_SECRET` is missing, rather
than starting and failing per-request. CORS allows `CLIENT_URL` only.

The real Atlas credential is entered by the user directly into `server/.env` and is never pasted
into chat or committed.

## Verification

Manual end-to-end, with actual output reported:

1. Server boots and connects to Atlas; `GET /api/health` responds.
2. Register a consumer → `201`, token returned, no password hash in the response.
3. Register a retailer with `farmName`/`location` → `201`.
4. Register a retailer **without** `farmName` → `400` naming the missing field.
5. Re-register the same email → `409` naming email. Same for phone.
6. Log in by email → `200`. Log in by phone in all three formats (`+91…`, `0…`, bare) → `200`.
7. Wrong password and unknown identifier → `401`, byte-identical message.
8. `GET /me` with the token → `200`. Without, and with a tampered token → `401`.
9. A consumer token on a `requireRole('retailer')` route → `403`.
10. In the browser: both signup paths, both login identifiers, role redirects, refresh-persists-session,
    logout clears it, and a consumer manually visiting `/retailer` is bounced.

## Out of scope

Product listings, cart, orders, payments, password reset, email/SMS verification, refresh-token
rotation, and admin roles. Each is a separate spec. `role` is an enum specifically so an `admin`
value can be added later without a migration.
