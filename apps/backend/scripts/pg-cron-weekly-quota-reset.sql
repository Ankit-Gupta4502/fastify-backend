-- Paste this into the Supabase SQL Editor (Database → SQL Editor).
-- Prerequisite: enable the "pg_cron" extension first — Database → Extensions → pg_cron.
-- Re-running this script is safe: the function is CREATE OR REPLACE and the job is unscheduled before re-scheduling.

create or replace function reset_weekly_quota()
returns void
language plpgsql
as $$
begin
  update "user" u
  set
    sessions_used_this_week = 0,
    week_reset_at = date_trunc('week', now())
  where u.week_reset_at < date_trunc('week', now())
    and u.id in (
      select us.user_id
      from user_subscriptions us
      join plans p on p.id = us.plan_id
      where us.status = 'active'
        and p.billing_interval = 'week'
        and p.sessions_per_week is not null
        and (us.sessions_total is null or us.sessions_used < us.sessions_total)
    );
end;
$$;

select cron.unschedule('weekly-quota-reset')
where exists (select 1 from cron.job where jobname = 'weekly-quota-reset');

-- Every Monday at 00:05 UTC (same schedule as the old node-cron job).
select cron.schedule(
  'weekly-quota-reset',
  '5 0 * * 1',
  $$select reset_weekly_quota();$$
);

-- One-off: run immediately to catch up any stale counters, equivalent to the
-- startup catch-up the old job did on every app boot.
-- select reset_weekly_quota();

-- Check run history:
-- select * from cron.job_run_details where jobname = 'weekly-quota-reset' order by start_time desc limit 20;
