# Saving Grace – Frontend

Client-facing and staff-facing UI for [Saving Grace Animals for Adoption](https://savinggracenc.org), a dog shelter in Wake Forest, NC. Provides adopters and shelter staff with tools for appointment scheduling, watchlists, messaging, check-in/check-out, and pending adoptions.

---

## Tech Stack

- **Framework:** React + TypeScript (Vite)
- **Styling:** Tailwind CSS
- **Icons:** FontAwesome

---

## Getting Started

### Prerequisites

- Node.js v22 (LTS) or later
- npm

### Installation

```bash
git clone <repo-url>
cd sheltercenter-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```properties
VITE_BACKEND_API_ROOT="http://localhost:8000"
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.
