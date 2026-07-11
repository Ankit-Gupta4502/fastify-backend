ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS price_per_session_cents integer;

UPDATE plans SET category = 'standard' WHERE name IN ('group_live', 'private');

INSERT INTO plans (name, price_cents, price_per_session_cents, billing_interval, sessions_per_month, allows_private, allows_time_flexibility, category)
VALUES
  ('prenatal_postnatal', 8000, 2000, 'month', 4, true,  true,  'specialized'),
  ('therapeutic_yoga',   8000, 2000, 'month', 4, false, false, 'specialized')
ON CONFLICT (name) DO NOTHING;
