# KineticAI

> AI-powered creative media generation platform with project management, comparison tools, and S3-backed asset storage.

## Features

- **AI Generation Studio** -- Generate creative media content with customizable parameters and model selection
- **Project Dashboard** -- Organize and manage generation projects with status tracking and metadata
- **Project Browser** -- Browse all projects with filtering, sorting, and search capabilities
- **Comparison Tool** -- Side-by-side comparison of generated outputs for quality evaluation
- **Asset Management** -- S3-backed file storage with presigned URLs for secure upload and download
- **Rich UI Components** -- Full component library with sliders, selects, toggles, progress bars, file uploads, and toasts
- **Notification System** -- Real-time notifications for job completions and status updates

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Framework | Next.js 14 (App Router)                         |
| Language  | TypeScript                                      |
| UI        | Tailwind CSS, Radix UI, Framer Motion, CVA      |
| Storage   | AWS S3 (presigned uploads)                      |
| State     | Zustand                                         |
| Backend   | Supabase (Auth + Database)                      |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add Supabase and AWS S3 credentials

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
kineticai/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx       # Navigation sidebar
│   │   └── ui/                   # Button, Slider, Select, Toggle, etc.
│   ├── store/                    # Zustand stores (UI, notifications, jobs)
│   └── utils/                    # Utility functions
├── public/                       # Static assets
└── package.json
```

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start dev server           |
| `npm run build`   | Production build           |
| `npm run start`   | Start production server    |
| `npm run lint`    | Run ESLint                 |
| `npm run db:migrate` | Push database migrations |
| `npm run db:seed` | Seed initial data          |

## License

MIT
