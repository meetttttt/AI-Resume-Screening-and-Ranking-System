# AI Resume Screening

<div align="center">

  <h1>AI Resume Screening</h1>
  <p>Find your perfect candidates with AI-powered resume screening and ranking</p>

</div>

## Features

- **AI-powered analysis** — Analyze resumes against job requirements
- **Smart ranking** — Rank candidates by skills, experience, and education match
- **Detailed insights** — AI-generated candidate summaries
- **Responsive UI** — Desktop, tablet, and mobile
- **Skills matching** — Matched and missing skills at a glance
- **Resume upload** — PDF and DOCX
- **Saved screenings (Supabase)** — Sign in to persist runs; team members see a shared catalog of saved results
- **Attribution** — Each saved row records who screened it (`screened_by_user_id`, `screened_by_email`) for the list and search UI

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI**: shadcn/ui-style primitives in `components/ui/` (trimmed to what the app uses), Framer Motion
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) (`toast` API + `<Toaster />` in the root layout)
- **AI**: OpenAI (see `lib/resume-analyzer.ts`)
- **Files**: `pdf-parse`, mammoth (DOCX)
- **Backend / auth / data**: Supabase (Auth + Postgres + Row Level Security)

## Getting started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com/) project (for sign-in and saving screenings)
- An OpenAI API key

### Installation

1. Clone the repo and enter the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment variables: copy the sample file and edit values.

   ```bash
   cp .env.example .env.local
   ```

   `.env.example` lists every variable the app reads (`OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional publishable key and `NEXT_PUBLIC_APP_URL`). The app also accepts `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` instead of the anon key (see `lib/supabase/env.ts`).

4. Apply the database schema and policies to Supabase (see [Supabase database setup](#supabase-database-setup)).

5. Start the dev server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Supabase database setup

Saved candidate rows live in `public.candidate_results`. The app inserts rows with `user_id`, `screened_by_user_id`, `screened_by_email`, job requirements, candidate JSON, and a derived `ui_snapshot` for consistent list/detail display.

### Option A — Supabase CLI (recommended)

From the project root, run migrations in order under `supabase/migrations/`:

| Migration | Purpose |
|-----------|---------|
| `20250328120000_candidate_results.sql` | Table + indexes + RLS enabled |
| `20250328140000_candidate_results_ui_snapshot.sql` | `ui_snapshot` column |
| `20250329120000_list_saved_candidates_rpc.sql` | `list_saved_candidate_results` RPC (pagination + search) |
| `20250329140000_candidate_results_user_rls.sql` | `user_id`; per-user select/insert policies |
| `20250330120000_candidate_results_select_legacy_null_user.sql` | Temporary broader read for legacy `user_id IS NULL` rows (superseded by next migration for final behavior) |
| `20250330130000_shared_candidates_screened_by.sql` | **`screened_by_*` columns**, shared read for all authenticated users, stricter insert check, RPC returns attribution + search by screener email |

Use `supabase db push` or your usual linked-project workflow so every file runs once, in filename order.

### Option B — SQL Editor

You can paste `supabase/setup_candidate_results.sql` for base table and columns, then run the remaining migration SQL from `supabase/migrations/` in the same chronological order so RLS policies and the RPC match the app.

### Security model (current)

- **SELECT**: Any **authenticated** user can read **all** rows in `candidate_results` (shared team inbox). Unauthenticated clients have no table access via these policies.
- **INSERT**: Allowed only when `user_id` and `screened_by_user_id` both equal `auth.uid()` (the app sets both to the signed-in user).
- **Listing**: Prefer `list_saved_candidate_results(search, limit, offset)`; it returns `{ total, rows }` and supports search on candidate name/email/title, job title, and screener email.

If you need strict per-user isolation instead of a shared catalog, replace the select policy with `using (user_id = auth.uid())` and adjust product expectations accordingly.

## How to use

1. **Sign in** — Use Supabase Auth (login/signup routes in `app/login`, `app/signup`).
2. **Job requirements** — Title, description, skills, experience, education.
3. **Upload resumes** — PDF or DOCX.
4. **Review results** — Rankings, skills, AI notes; save runs to Supabase when configured.
5. **Screened candidates** — Open the saved list tab to search and open past screenings (includes who screened each candidate when available).

## Project structure

```plaintext
├── app/                      # Next.js App Router
│   ├── auth/                 # Callback + server actions
│   ├── login/ / signup/      # Auth pages
│   ├── layout.tsx / page.tsx
│   └── globals.css
├── components/               # Feature + UI components
│   ├── resume-screening-dashboard.tsx
│   ├── screened-candidates-tab.tsx
│   └── ui/                   # shadcn-style primitives only (badge, button, card, …)
├── .env.example              # Committed env template — copy to `.env.local` for secrets (see `.gitignore`)
├── components.json           # shadcn CLI config — run `npx shadcn@latest add <component>` to add more UI
├── lib/
│   ├── resume-analyzer.ts    # OpenAI screening
│   ├── save-candidates.ts    # Insert saved rows (server)
│   ├── list-saved-candidates.ts
│   ├── match-derived.ts      # ui_snapshot helpers
│   ├── supabase/             # Server client, middleware, env
│   └── types.ts
├── supabase/
│   ├── migrations/           # Ordered SQL migrations
│   └── setup_candidate_results.sql
└── public/
```

## Configuration

- **Tailwind**: `tailwind.config.js`
- **AI model / prompts**: `lib/resume-analyzer.ts`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit and push
4. Open a pull request

## License

Specify a license in a `LICENSE` file at the repo root if you publish this project.

## Acknowledgements

- [OpenAI](https://openai.com/) for AI models
- [Supabase](https://supabase.com/) for auth and database
- [shadcn/ui](https://ui.shadcn.com/) for UI primitives
- [Vercel](https://vercel.com/) for Next.js hosting patterns
