# Performance Brain - Mission Control

A Next.js 16 dashboard to monitor and manage Elfred's Performance Brain (Obsidian vault + Hermes Agent).

## Quick Start

```bash
npm install
npx prisma db push
npm run dev
```

Then open http://localhost:3000

## Features

- **Overview**: Vault stats, skill count, session history
- **Vault**: Browse all notes by type/folder with status tracking
- **Skills**: Grid of installed Hermes skills
- **Sessions**: Recent conversation history
- **Articles**: Research papers with DOI/PubMed links
- **Cron Jobs**: Scheduled task management
- **Health Log**: System status over time

## Tech Stack

- Next.js 16 (App Router)
- Prisma 6 (SQLite)
- Tailwind CSS v4
- Lucide React icons
- TypeScript

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Overview dashboard
│   ├── vault/            # Vault browser
│   ├── skills/           # Skills grid
│   ├── sessions/         # Session history
│   ├── articles/         # Research articles
│   ├── cron/             # Cron job management
│   └── api/              # API routes
├── components/
│   ├── sidebar.tsx       # Navigation
│   └── ui/               # Reusable components
└── lib/
    └── prisma.ts         # Prisma client
prisma/
└── schema.prisma         # Database schema
data/
└── performance-brain.db  # SQLite database
```

## Customization

Edit `prisma/schema.prisma` to add new models, then run:

```bash
npx prisma db push
```

## License

MIT
