# Saving Grace – Frontend

Client and staff UI for [Saving Grace Animals for Adoption](https://savinggracenc.org), a dog shelter in Wake Forest, NC. Provides adopters and shelter staff with tools for appointment scheduling, watchlists, check-in/check-out, pending adoptions, and dog management.

**Production:** [savinggracencscheduler.com](https://savinggracencscheduler.com)

---

## Tech Stack

- **Framework:** React 18 + TypeScript 5.6
- **Build tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **UI components:** MUI 6, rsuite 5
- **Routing:** React Router 7
- **State:** Zustand (persisted to localStorage)
- **HTTP:** Axios
- **Rich text:** React Quill (email template editor)

---

## Getting Started

### Prerequisites

- Node.js v22 (LTS) or later
- npm

### Installation

```bash
git clone https://github.com/sleif9777/Sheltercenter-frontend.git
cd Sheltercenter-frontend
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```properties
VITE_BACKEND_API_ROOT="http://localhost:8000"
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build    # output to dist/
npm run lint     # ESLint check before committing
```

---

## User Roles

| Role | Description |
|---|---|
| Adopter | Books appointments, manages watchlist and preferences |
| Admin | Full staff access — schedule, adopter directory, reports |
| Greeter | Check-in/check-out for day-of appointments |

---

## Key Pages

| Route | Page | Audience |
|---|---|---|
| `/my_home/` | Adopter home | Adopters |
| `/calendar` | Appointment schedule | Staff/Admin |
| `/adopters/directory/` | Adopter directory | Admin |
| `/adopters/detail/:id` | Adopter profile | Admin |
| `/in_progress/` | In-progress appointments | Admin |
| `/chosen_board/` | Dogs selected for appointments | Admin |
| `/calendar_template/` | Recurring schedule templates | Admin |
| `/daily_report/:date/` | Daily report | Admin |

---

## Contributing

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(watchlist): show dog photo on watchlist card
fix(schedule): prevent duplicate booking submissions
chore: bump react-router-dom to 7.2
```
