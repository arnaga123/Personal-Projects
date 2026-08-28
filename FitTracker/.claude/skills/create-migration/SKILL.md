---
name: create-migration
description: Scaffold and apply a new Supabase SQL migration for FitTracker, following this project's existing numbering and style. Use when the user asks to add a column, table, or other schema change.
---

# Create a FitTracker migration

## Convention (from `supabase/migrations/`)

- Files are named `NNNN_short_description.sql`, zero-padded to 4 digits, sequential from the highest existing number.
- Every file opens with a short comment block explaining *why* the change exists and what depends on it (not just what the SQL does — see `0007_onboarding.sql` for the shape).
- Prefer `add column if not exists` / `create table if not exists` so a migration is safe to re-run.
- Keep each migration focused on one change; don't bundle unrelated schema changes together.

## Steps

1. Check the highest existing migration number:
   ```bash
   ls supabase/migrations/ | sort | tail -1
   ```
2. Write the new file as `supabase/migrations/NNNN_description.sql` with the header-comment + SQL pattern above.
3. Apply it. If the `supabase` MCP server is configured (see `.mcp.json` — requires `SUPABASE_ACCESS_TOKEN` in the environment), use its migration/SQL tools to run the file against the live database and to verify the change (e.g. query the affected table's schema afterward). This replaced an earlier, riskier workflow in this project of hand-running a scratch script over a direct Postgres connection — prefer the MCP path now that it exists.
4. If the MCP server isn't available, tell the user the exact SQL to run themselves in the Supabase SQL editor rather than trying to reach the database another way.
5. Update `lib/data/*.ts` / `lib/validations/*.ts` if the schema change adds a column or table that application code needs to read or write.

## Never

- Never run a migration that drops a column or table without the user explicitly confirming — schema deletions are not reversible from a migration file alone.
- Never invent a Supabase access token or credential. If `SUPABASE_ACCESS_TOKEN` isn't set, ask the user to generate one from their Supabase account settings and set it in their environment.
