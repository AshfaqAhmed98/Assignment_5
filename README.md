# EventMatrix

EventMatrix helps people discover and take part in local community events. The
frontend is built with Next.js App Router, TypeScript, Tailwind CSS, and DaisyUI.

**Live site:** [https://eventmatrix-frontend.vercel.app](https://eventmatrix-frontend.vercel.app)

## Features

- Browse upcoming community events, sorted by event date.
- View event details and join events while signed in.
- Create events with a date, location, and image.
- Upload event thumbnails or provide an image URL.
- Manage, edit, and delete events you created.
- View and remove events from your joined-events list.
- Sign in with email and password or Google.
- Switch between light and dark themes.

## Run locally

Start the backend first (see [Backend README](../Backend/README.md)). Then, from
this directory, run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend connects to
the backend at `http://localhost:3001` by default. To use a different backend,
set `BACKEND_URL` and `NEXT_PUBLIC_BACKEND_URL` in `.env.local`.

## Scripts

- `npm run dev` — start the development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — serve the production build
