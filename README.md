# EventMatrix

EventMatrix is a community-driven event platform for discovering, creating,
and joining local social-service events. The client uses the Next.js App
Router, TypeScript, Tailwind CSS, and DaisyUI; event and authentication APIs
are provided by the Express/MongoDB backend.

**Live site URL:** Not deployed yet. Add the public client URL here after
deployment.
**Local development URL:** [http://localhost:3000](http://localhost:3000)

## Features

- Browse upcoming community-service events ordered by date, with pagination.
- View event details publicly and join events while signed in.
- Create events with a future date, public image URL, or uploaded thumbnail.
- Manage, update event details and thumbnail images, and delete only your own events.
- Track joined events and remove an event from your personal list.
- Sign up and log in with BetterAuth using email/password or Google; protected
  event requests use short-lived signed JWT access tokens.
- Switch between persisted light and dark themes; layouts adapt to mobile,
  tablet, and desktop screens.
- See loading skeletons while event lists are loading.
- Explore a static community photo gallery and a visual-only newsletter section.

## Getting started

Run MongoDB and configure `Backend/.env.local` with `MONGODB_URI`,
`MONGODB_DATABASE`, and a private `JWT_SECRET` of at least 32 bytes. Start the
backend in a separate terminal:

```bash
cd ../Backend
npm run dev
```

Then start the frontend from this directory:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
The frontend proxies `/backend/*` requests to `http://localhost:3001` by
default. Set `BACKEND_URL` in the frontend environment if the backend uses a
different origin.

The homepage shows the six nearest upcoming events from the database, a
volunteer photo gallery, and a newsletter signup design. The newsletter form is
visual only and does not submit or store email addresses. A shared footer
provides navigation and project information across routes. Use the theme toggle
in the navbar to switch between the persisted light and dark themes.

BetterAuth uses the backend's `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
`FRONTEND_ORIGIN`, and Google OAuth credentials. Set
`NEXT_PUBLIC_BACKEND_URL` in `Frontend/.env.local` to the same backend origin
as `BETTER_AUTH_URL` (for local development, `http://localhost:3001`), then
restart both servers. The backend accepts credentialed cross-origin auth
requests from the configured frontend origins. In Google Cloud Console,
configure the BetterAuth
callback URL as an authorized redirect URI:
`<BETTER_AUTH_URL>/api/better-auth/callback/google`.
Google profile photos and registration photo URLs appear in the signed-in
navbar. Uploaded registration photos are stored by the backend and shown on
the signed-in profile. The authenticated navbar includes a logout button.

Existing email/password accounts are migrated to BetterAuth on their first
successful login. The backend exchanges the BetterAuth session for the
short-lived JWT still used by the event API, preserving existing event-owner
IDs during this transition.

Events can be listed, viewed, and created by signed-in users. After creation,
the app confirms success and returns to the upcoming events page. Thumbnails
can be entered as public HTTP/HTTPS URLs or uploaded as JPG/PNG files up to
50 MB. Event owners can replace thumbnails with either a URL or an upload when
editing. Uploaded images are stored by the backend and served with the event.
Signed-in users can join an event and view their joined event snapshots ordered
by event date at `/joined-events`, where they can also remove events they have
joined.
Creators can view and manage their own events at
`/manage-events`. Authentication and event forms validate input in the client,
and the backend validates requests again before processing them. Protected
APIs require a signed, expiring JWT bearer token; event updates and deletes are
restricted to their creator.

## Project structure

- `app/page.tsx` — home page
- `app/layout.tsx` — root layout and metadata
- `app/globals.css` — global styles
- `app/events/` — live event listing and details
- `app/create-event/` — authenticated event creation
- `app/joined-events/` — joined event list
- `app/manage-events/` — creator-only event management
- `components/` — reusable UI components
- `lib/event-api.ts` — frontend event API requests
- `lib/auth.tsx` — frontend authentication state and API requests
- `lib/events.ts` — shared event types

Tailwind utility classes and DaisyUI components are available throughout the
app.

## Scripts

- `npm run dev` — start the development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — serve the production build
