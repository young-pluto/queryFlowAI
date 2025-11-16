# QueryFlow AI

QueryFlow AI is an interactive, demo-friendly contact center that showcases how modern support teams can triage, classify, and route multi-channel conversations with OpenAI, Supabase, and a responsive React UI. It combines a “User Console” for composing messages, a “Routing” hub that visualizes AI decisions, and an “Admin Inbox” where operators manage status, assignments, and notes in real time.

## Why it’s interesting

- **Innovation:** Live demo mode streams realistic traffic by prompting OpenAI’s Responses API, auto-classifying each query (department, sentiment, urgency, summary, tags, suggested reply) and writing the result to Supabase. The experience feels “alive” for judges or stakeholders without needing real users.
- **Creativity & Product Thinking:** The app mirrors a real workspace—users compose per-channel payloads, admins filter by channel, assign work manually or via “Auto assign (AI)”, and analytics panels highlight sentiment and urgency. Everything is optimized for storytelling during a pitch or demo.
- **Technical Depth:** Built on Vite + React + TypeScript with shadcn/ui, Tailwind, Zustand, TanStack Query, Supabase Edge functions, and OpenAI’s Responses API. It demonstrates optimistic updates, streaming demos, Edge handlers with JSON sanitization, and a mobile-friendly admin experience.

## Feature Highlights

- **User Console:** Channel-specific composers (WhatsApp, Twitter, Email) with live payload preview, validation, and AI classification feedback.
- **Routing Manager:** Real-time overview of totals, sentiment, urgency, reviewers, and the latest AI-classified inbox (including who it’s assigned to).
- **Admin Inbox:** Channel filters, clear-inbox action, status updates, “assign to me”, “auto assign”, department dropdown, notes, and animated assignment feedback.
- **Demo Session Orchestrator:** One tap starts a 30-second AI session that auto-terminates (to protect API budgets) while showing a visible countdown across the app.
- **Edge Functions:** `/api/generate-demo-query` (OpenAI multi-item batches), `/api/classify-and-route`, and CRUD endpoints for `/api/queries` (including a Supabase RPC to truncate the table safely).

## Tech Stack

- **Frontend:** Vite + React + TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, Framer Motion, Recharts, clsx.
- **Backend / Infra:** Supabase (Postgres, RPC, Realtime), Vercel Edge Functions, OpenAI Responses API.
- **Tooling:** ESLint/TypeScript strict configs, npm scripts (`dev`, `build`, `preview`).

## Getting Started

```bash
pnpm install    # npm/yarn works too
pnpm dev        # runs Vite on http://localhost:5173
```

### Required environment variables

| Name | Location | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Server | Calls to Responses API for classification + demo traffic |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase Edge functions + RPC |
| `SUPABASE_ANON_KEY` | Client/Server | Auth for browser + Edge |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Client | Supabase browser client |

Add them locally via `.env` / `.env.local` and on Vercel under Project Settings → Environment Variables.

### Supabase setup

1. Create the `queries` table (id UUID default, user/channel/message fields, status, assigned_to, etc.).
2. Run the SQL helper in `api/_shared/delete.sql` to create the `delete_all_queries()` RPC used by the “Clear inbox” action.
3. Enable Realtime on the `queries` table for live updates inside the app.

## Deployment

1. Push the repo to GitHub.
2. Import into Vercel, set the environment variables (client + server scopes as needed).
3. Vercel auto-builds the Vite SPA and deploys the Edge functions under `apps/web/queryflow-ai/api/*`.

## Project Structure

```
apps/
  web/queryflow-ai/
    src/
      pages/             # Landing, Routing, User Console, Admin, Analytics
      components/ui/     # shadcn primitives
      components/composers/
      services/          # Supabase + API helpers
      store/             # Zustand role store
      shared/            # constants, types, utils
    api/                 # Edge functions (OpenAI, queries, RPC helpers)
```

## Demo Flow

1. **Start Session** on the landing page. A countdown appears, OpenAI generates 2–3 varied queries every few seconds, and Supabase broadcasts them to all tabs.
2. **Routing Tab** updates live: totals, sentiment %, urgency, assignment badges.
3. **Admin Inbox** filters by channel, allows manual or AI assignment, shows subtle animations when assignments change, and captures notes.
4. **User Console** lets you compose individual payloads, preview the exact JSON (with loaders), and watch them route through the system instantly.

## Next Ideas

- Hook up Supabase Realtime for cross-team presence, escalate tickets to external tools, or export analytics snapshots.
- Replace the stub analytics with actual Recharts fed by Supabase aggregations.
- Allow prompt tweaking for the classification LLM directly from the UI.

Enjoy the build, and feel free to fork it for your own AI ops showcase! 🎯
