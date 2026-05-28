# Entropi Frontend

Full project documentation is maintained in the backend repository's `/docs` folder.

Seller dashboard for the Entropi financial order processing system.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript (strict)
- Tailwind CSS

## Getting Started

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Order status cards with polling-based live updates
- Ledger audit trail with exact decimal running balance
- Create order modal with amount validation
- Settlement preview, execution, and history
- Mobile-first responsive design
