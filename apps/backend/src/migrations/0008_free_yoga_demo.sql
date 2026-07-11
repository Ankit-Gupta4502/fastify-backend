-- Demo request status enum
CREATE TYPE demo_request_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'needs_information',
  'instructor_assigned',
  'meeting_scheduled',
  'completed'
);

-- Demo requests table
CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

  -- Personal info
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Goals (array of selected purposes)
  purposes TEXT[] NOT NULL,
  other_purpose TEXT,

  -- Schedule stored in user's local terms + UTC resolved time
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  timezone TEXT NOT NULL,
  utc_scheduled_at TIMESTAMPTZ NOT NULL,

  -- Instructor assignment & meeting
  assigned_instructor_id UUID REFERENCES "user"(id),
  meeting_link TEXT,
  meeting_platform TEXT,

  -- Status tracking
  status demo_request_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  needs_info_message TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_demo_requests_user   ON demo_requests(user_id);
CREATE INDEX idx_demo_requests_status ON demo_requests(status);
CREATE INDEX idx_demo_requests_utc    ON demo_requests(utc_scheduled_at);
CREATE INDEX idx_demo_requests_instructor
  ON demo_requests(assigned_instructor_id)
  WHERE assigned_instructor_id IS NOT NULL;
