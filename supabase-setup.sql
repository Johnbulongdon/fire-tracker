-- UntilFire Supabase bootstrap
-- Run this in your Supabase project's SQL Editor on a fresh environment.
--
-- Tables created:
--   - user_budget       (dashboard income/expenses + FIRE profile json)
--   - expenses          (transaction log used by /dashboard transactions tab)
--   - subscriptions     (Stripe Pro tier mirror)
--   - waitlist          (public landing waitlist signups)
--
-- Auth model: Supabase Google OAuth + RLS. There is no Next.js middleware.ts;
-- /dashboard redirects to /login client-side when no session is found.
-- See AUTH_SETUP.md for the full live architecture.

-- ─── Shared helpers ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── user_budget (dashboard primary store) ──────────────────────────────────
-- Backs app/dashboard/page.tsx and app/dashboard/TransactionsTab.tsx.
-- One row per authenticated user; expenses jsonb holds budget categories
-- plus a `_fire_profile` blob (k401, rothIRA, taxable, totalDebt, etc.).
CREATE TABLE IF NOT EXISTS user_budget (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  income      NUMERIC(12,2) NOT NULL DEFAULT 0,
  expenses    JSONB         NOT NULL DEFAULT '{}'::jsonb,
  fire_age    INTEGER       NOT NULL DEFAULT 30,
  fire_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE user_budget ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_budget owner select" ON user_budget;
CREATE POLICY "user_budget owner select" ON user_budget
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_budget owner insert" ON user_budget;
CREATE POLICY "user_budget owner insert" ON user_budget
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_budget owner update" ON user_budget;
CREATE POLICY "user_budget owner update" ON user_budget
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_budget owner delete" ON user_budget;
CREATE POLICY "user_budget owner delete" ON user_budget
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_budget_updated_at ON user_budget;
CREATE TRIGGER update_user_budget_updated_at
  BEFORE UPDATE ON user_budget
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT ALL ON user_budget TO authenticated;
GRANT ALL ON user_budget TO service_role;

-- ─── expenses (transaction log) ─────────────────────────────────────────────
-- Used by the Transactions tab. Stores both income and expense rows; the
-- transaction_type column distinguishes them.
CREATE TABLE IF NOT EXISTS expenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'USD',
  description      TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT 'other',
  tags             TEXT[] NOT NULL DEFAULT '{}',
  is_work_related  BOOLEAN NOT NULL DEFAULT FALSE,
  transaction_type TEXT NOT NULL DEFAULT 'expense'
    CHECK (transaction_type IN ('expense', 'income')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS expenses_user_id_idx     ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx   ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS expenses_user_cat_idx    ON expenses(user_id, category);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses owner select" ON expenses;
CREATE POLICY "expenses owner select" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "expenses owner insert" ON expenses;
CREATE POLICY "expenses owner insert" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "expenses owner update" ON expenses;
CREATE POLICY "expenses owner update" ON expenses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "expenses owner delete" ON expenses;
CREATE POLICY "expenses owner delete" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT ALL ON expenses TO authenticated;
GRANT ALL ON expenses TO service_role;

-- ─── subscriptions (Stripe Pro tier mirror) ─────────────────────────────────
-- Read by lib/supabase.ts getSubscription/isPro and written by
-- app/api/stripe/webhook/route.ts using the service role key.
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  status                 TEXT NOT NULL DEFAULT 'inactive',  -- active | inactive | canceled | past_due
  plan                   TEXT NOT NULL DEFAULT 'free',       -- free | pro
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_customer_id_idx
  ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Reads only — writes happen with the service role key from the Stripe webhook.
DROP POLICY IF EXISTS "subscriptions owner select" ON subscriptions;
CREATE POLICY "subscriptions owner select" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT SELECT ON subscriptions TO authenticated;
GRANT ALL    ON subscriptions TO service_role;

-- ─── waitlist (public landing capture) ──────────────────────────────────────
-- Written by app/api/waitlist/route.ts using the anon key, so the table needs
-- an INSERT policy that does not require auth.uid(). No reads from the client.
CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waitlist anon insert" ON waitlist;
CREATE POLICY "waitlist anon insert" ON waitlist
  FOR INSERT WITH CHECK (true);

-- No SELECT policy → anon/authenticated cannot read. Service role bypasses RLS.
GRANT INSERT ON waitlist TO anon;
GRANT INSERT ON waitlist TO authenticated;
GRANT ALL    ON waitlist TO service_role;
