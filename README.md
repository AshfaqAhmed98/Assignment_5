# Assignment 5

Next.js App Router frontend using TypeScript, Tailwind CSS, and DaisyUI. Login,
registration, upcoming event listings, event details, and event creation use
the separate Express backend.

## Getting started

Start the backend first in a separate terminal:

```bash
cd ../Backend
npm run dev
```

Then start the frontend from this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
The frontend proxies `/backend/*` requests to `http://localhost:3001` by
default. Set `BACKEND_URL` in the frontend environment if the backend uses a
different origin.

The homepage includes upcoming community events, a volunteer photo gallery, and
a newsletter signup design. The newsletter form is visual only and does not
submit or store email addresses. A shared footer provides navigation and
project information across routes.

Google sign-in uses Google Identity Services. Set
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `Frontend/.env.local` to the same web client
ID as `GOOGLE_CLIENT_ID` in `Backend/.env.local`, then restart the frontend.
In Google Cloud Console, allow the frontend's origin under Authorized
JavaScript origins (for local development, `http://localhost:3000`).

Events can be listed, viewed, and created by signed-in users. The event API
currently accepts public HTTP/HTTPS thumbnail URLs; selecting a local image
only previews it and does not upload it. Signed-in users can join an event and
view their joined event snapshots at `/joined-events`. Creators can view and
manage their own events at `/manage-events`.

## Project structure

- `app/page.tsx` — home page
- `app/layout.tsx` — root layout and metadata
- `app/globals.css` — global styles
- `app/events/` — live event listing and details
- `app/create-event/` — authenticated event creation
- `app/(protected)/` — joined event list and creator-only event management
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
