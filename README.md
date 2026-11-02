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

Events can be listed, viewed, and created by signed-in users. The event API
currently accepts public HTTP/HTTPS thumbnail URLs; selecting a local image
only previews it and does not upload it. Joining events and managing,
updating, or deleting events are still UI previews because those backend APIs
are not available yet.

## Project structure

- `app/page.tsx` — home page
- `app/layout.tsx` — root layout and metadata
- `app/globals.css` — global styles
- `app/events/` — live event listing and details
- `app/create-event/` — authenticated event creation
- `app/(protected)/` — joined and managed event UI previews
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
