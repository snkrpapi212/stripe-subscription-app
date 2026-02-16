# CLAUDE.md Project Constraints (always active)
## Stack (non-negotiable, I will mass git revert you)
- Frontend: Next.js 14+ App Router, TypeScript strict
- Backend: Convex for real-time data, Supabase for auth + storage
- Auth: Clerk (never roll custom auth, we are not animals)
- Styling: Tailwind only no CSS modules, no styled-components
## Hard Rules
- Never install a new dependency without asking first
- Never modify the database schema without showing the migration plan
- All API calls go through Convex functions, never direct Supabase 
  client calls from components
- Environment variables go in .env.local, never hardcoded
  (I will find you and I will revert you)
## Patterns
- Use server components by default, client components only when 
  interactivity is required
- Error boundaries on every route segment
- Zod validation on every user input
