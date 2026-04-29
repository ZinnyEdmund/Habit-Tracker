# Habit Tracker PWA

## Project Overview

This project is a mobile-first Habit Tracker Progressive Web App built from the Stage 3 Technical Requirements Document.

The app supports:

- local signup with email and password
- local login and logout
- create, edit, delete, complete, and unmark daily habits
- current streak display
- local persistence across reloads
- installable PWA support
- offline app shell loading after the app has been loaded once

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- localStorage
- Vitest
- React Testing Library
- Playwright

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3001`.

## Run Instructions

- Development: `npm run dev`
- Production build: `npm run build`
- Production server: `npm run start`

## Test Instructions

- Unit tests with coverage: `npm run test:unit`
- Integration tests: `npm run test:integration`
- End-to-end tests: `npm run test:e2e`
- Full suite: `npm run test`

The coverage report is generated in [`coverage/`](./coverage).

## Local Persistence Structure

The app uses `localStorage` only, with these keys:

- `habit-tracker-users`
- `habit-tracker-session`
- `habit-tracker-habits`

Stored shapes:

- `habit-tracker-users`: JSON array of `User`
- `habit-tracker-session`: `null` or `Session`
- `habit-tracker-habits`: JSON array of `Habit`

Type contracts are defined in:

- [`src/types/auth.ts`](src/types/auth.ts)
- [`src/types/habit.ts`](src/types/habit.ts)

## PWA Implementation

PWA support is implemented with:

- [`public/manifest.json`](public/manifest.json)
- [`public/sw.js`](public/sw.js)
- [`public/icons/icon-192.png`](public/icons/icon-192.png)
- [`public/icons/icon-512.png`](public/icons/icon-512.png)
- client-side registration in [`src/components/shared/ServiceWorkerRegistration.tsx`](src/components/shared/ServiceWorkerRegistration.tsx)

The service worker caches the app shell and stores fetched assets so the app can render offline after it has been loaded once.

## Technical Requirement Mapping

- `/` renders the splash screen, waits briefly, checks local session state, and redirects
- `/signup` creates a user in local storage, creates a session, and redirects to `/dashboard`
- `/login` validates credentials, creates a session, and redirects to `/dashboard`
- `/dashboard` is protected and renders only the logged-in user's habits
- `src/lib/slug.ts`, `src/lib/validators.ts`, `src/lib/streaks.ts`, and `src/lib/habits.ts` expose the required utility functions
- required test ids are implemented for splash, auth forms, dashboard, habit form, habit cards, delete confirmation, and logout

## Trade-offs and Limitations

- Authentication is intentionally local-only because the TRD requires deterministic front-end persistence with no external auth service.
- Habit frequency is limited to `'daily'` because that is the only frequency required in the TRD.
- Offline support is limited to the cached app shell and previously fetched assets; it is not a full sync-capable offline data system.
- Playwright is configured to use the installed Edge channel in this environment so the required e2e suite can run without downloading a separate bundled browser.

## Required Test Files

- `tests/unit/slug.test.ts`: verifies `getHabitSlug`
- `tests/unit/validators.test.ts`: verifies `validateHabitName`
- `tests/unit/streaks.test.ts`: verifies `calculateCurrentStreak`
- `tests/unit/habits.test.ts`: verifies `toggleHabitCompletion`
- `tests/integration/auth-flow.test.tsx`: verifies signup, duplicate signup rejection, login, and invalid login handling
- `tests/integration/habit-form.test.tsx`: verifies create, validation, edit, delete confirmation, and completion/streak updates
- `tests/e2e/app.spec.ts`: verifies splash routing, route protection, signup, login, create habit, completion, persistence after reload, logout, and offline cached shell loading
