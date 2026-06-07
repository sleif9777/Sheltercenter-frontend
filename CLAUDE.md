# Saving Grace – Frontend

React + TypeScript UI for [Saving Grace Animals for Adoption](https://savinggracenc.org), a dog shelter in Wake Forest, NC.

This repo is one half of a two-repo project. The other half is the Django backend at `https://github.com/sleif9777/Sheltercenter-backend.git`. See the parent workspace's `CLAUDE.md` for cross-repo context.

**GitHub remote:** `https://github.com/sleif9777/Sheltercenter-frontend.git`
**Heroku remote:** `https://git.heroku.com/sheltercenter-frontend.git`
**Production URL:** `https://savinggracencscheduler.com`

---

## Commit Convention

Use **Conventional Commits**: `<type>(<optional scope>): <short description>`

| Type | When to use |
|---|---|
| `feat` | New feature or user-visible behavior |
| `fix` | Bug fix |
| `refactor` | Code restructuring with no behavior change |
| `style` | Formatting, whitespace, no logic change |
| `chore` | Maintenance (deps, config) |
| `docs` | Documentation only |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |

Examples:
```
feat(watchlist): show dog photo on watchlist card
fix(schedule): prevent duplicate booking submissions
chore(deps): bump react-router-dom to 7.2
```

---

## Setup

```bash
npm install
```

### Environment Variables

Create `.env` in this directory:

```properties
VITE_BACKEND_API_ROOT="http://localhost:8000"
```

---

## Running Locally

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run lint     # ESLint check
```

---

## Stack

- React 18 + TypeScript 5.6
- Vite 6 (build tool)
- Tailwind CSS 4
- Axios (HTTP client)
- React Router 7
- Zustand via `persist-and-sync` (session state)
- MUI 6 + rsuite 5 (UI components)
- React Quill (rich text editor for email templates)
- React Toastify (notifications)
- Moment-timezone (date handling)

---

## Source Structure

```
src/
├── App.tsx              # Root component; all routes defined here
├── main.tsx             # Entry point
├── api/                 # Axios API clients, one subdirectory per resource
│   └── APIBase.ts       # Shared base class (auth headers, error handling)
├── pages/               # One component per route
├── forms/               # Form components for data entry
├── aforms/              # Admin-specific alternative forms
├── cards/               # Reusable display cards
├── core/
│   ├── components/      # Shared UI (toasts, messages)
│   ├── navigation/      # NavigationBar (role-aware links)
│   └── session/
│       └── SessionState.ts  # Zustand store — auth tokens, user profile, current appointment
├── models/              # TypeScript interfaces for all domain types
├── enums/               # Enum constants (security levels, user types, status values)
├── layouts/             # Page-level layout wrappers
├── utils/               # DateTime helpers and other utilities
└── assets/              # Static files (images, SVGs)
```

### Page state convention

A `*AppState.ts` file (Zustand store) is only created for a page when it needs shared state accessed by multiple child components. Pages that manage everything with local `useState` do not need one. When in doubt, start with `useState` and extract to a Zustand store only when two or more sibling components need to read or write the same value.

---

## Routing

All routes are defined in `App.tsx`. Authenticated routes:

| Path | Component | Audience |
|---|---|---|
| `/` or `/my_home/` | `AdopterLandingPageApp` | Adopters |
| `/preferences/` | `AdopterPreferencesApp` | Adopters |
| `/watchlist/` | `WatchlistApp` | Adopters |
| `/calendar` | `ScheduleApp` | Staff/Admin |
| `/calendar_template/` | `TemplateApp` | Admin |
| `/adopters/directory/` | `AdopterDirectoryApp` | Admin |
| `/adopters/detail/:id` | `AdopterDetailsApp` | Admin |
| `/adopters/upload/` | `AdopterUploadApp` | Admin |
| `/dashboards/` | `DashboardsApp` | Admin |
| `/chosen_board/` | `ChosenBoardApp` | Admin |
| `/in_progress/` | `InProgressAppointmentsApp` | Admin |
| `/recent_adoptions/` | `RecentAdoptionsApp` | Admin |
| `/recent_uploads/` | `RecentUploadsApp` | Admin |
| `/daily_report/:date/` | `DailyReportApp` | Admin |
| `/print_view/:date/` | `PrintViewApp` | Admin |

Unauthenticated: `/` → `LoginApp`

---

## User Roles

Three roles, stored as flags in the Zustand session store:

| Flag | Description |
|---|---|
| `adopterUser` | Adopters — can book appointments, manage watchlist/preferences |
| `adminUser` | Shelter staff — full access |
| `greeterUser` | Check-in/greeter role — limited staff access |

---

## Session State (`core/session/SessionState.ts`)

Zustand store persisted to `localStorage`. Contains:

- JWT access and refresh tokens
- User profile and role flags
- Current appointment reference
- Session expiration timestamp
- User acknowledgements (e.g. watchlist warning shown)

---

## Code Style

- **Prettier** — import sorting (`@trivago/prettier-plugin-sort-imports`), Tailwind class sorting (`prettier-plugin-tailwindcss`)
- **ESLint** — TypeScript, React Hooks, React Refresh plugins; Prettier integration
- Format on save enabled for TypeScript/TSX in VSCode
- TypeScript strict mode; no unused locals or parameters
