# Assignment 5

Next.js App Router starter using TypeScript, Tailwind CSS, and DaisyUI.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Better Auth and MongoDB

Better Auth runs in a Next.js route at `http://localhost:3000/api/auth`, so the
frontend and auth requests share one server and origin. Create a local
`.env.local` from `.env.example` (`Copy-Item .env.example .env.local` in
PowerShell), then set `MONGODB_URI` and `MONGODB_DATABASE`. The default URI
targets a MongoDB server running locally at `127.0.0.1:27017`; for MongoDB
Atlas, replace it with your Atlas connection string.

Set `BETTER_AUTH_SECRET` to a random secret of at least 32 characters. For
example, generate one with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Set `BETTER_AUTH_API_KEY` to the API key from Better Auth Infra to enable
authenticated Dash integration.
Google sign-in is enabled only when both `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` are configured. For local development, add
`http://localhost:3000/api/auth/callback/google` to the Google OAuth client's
authorized redirect URIs and keep `BETTER_AUTH_URL` at
`http://localhost:3000`. Open the frontend at that same origin. Email
verification is not enabled.

To connect Better Auth Dash or test Google OAuth using a public HTTPS origin,
expose the Next.js server on port `3000` through a public tunnel, for example:

```bash
cloudflared tunnel --url http://localhost:3000
```

Open the frontend using the tunnel URL, set `BETTER_AUTH_URL` to that same
public origin, and add `<tunnel-origin>/api/auth/callback/google` to the
Google OAuth client's authorized redirect URIs. Use the same hostname for
the frontend and auth callback. Quick Tunnel URLs can change each time a
tunnel is restarted.

Existing accounts and sessions in the previous local SQLite database are not
copied automatically. MongoDB's Better Auth adapter creates collections as
needed; no schema migration command is required.

After configuring `.env.local` and ensuring MongoDB is running, start the app:

```bash
npm run dev
```

Set `FRONTEND_ORIGIN` to the allowed frontend origin (or a comma-separated
list), and set `BETTER_AUTH_URL` to the origin used to open the app.

To test from another device on your local network, add its frontend origin to
`FRONTEND_ORIGIN` and `BETTER_AUTH_URL`. Restart Next.js after changing
`.env.local`. For Google OAuth, use a public HTTPS origin routed to the
Next.js server.

## Creating events

Signed-in users can create upcoming community events from `/create-event`.
Each event includes a title, description, type, thumbnail image URL or JPG/PNG
upload (up to 50 MB), location, and future date/time. Uploaded thumbnails are
stored in MongoDB GridFS. Events are stored in the
configured MongoDB database with the creating user's email, and upcoming
events appear in the homepage events section. Creator email addresses are not
included in the public events response.

## Project structure

- `app/page.tsx` — home page
- `app/layout.tsx` — root layout and metadata
- `app/globals.css` — global styles
- `app/api/auth/[...all]/route.ts` — Better Auth route handler
- `app/api/events/route.ts` — event creation and upcoming events API
- `app/create-event/page.tsx` — authenticated event creation page
- `server/auth.ts` — Better Auth and MongoDB configuration
- `postcss.config.mjs` — Tailwind CSS PostCSS integration

Tailwind utility classes and DaisyUI components are available throughout the app.

## Scripts

- `npm run dev` — start the development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — serve the production build
