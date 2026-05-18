-- Instructor rich-profile columns.
-- Run this after 0001_yoga_session_pool.sql

ALTER TABLE "instructor_details"
  ADD COLUMN IF NOT EXISTS "bio"                  text,
  ADD COLUMN IF NOT EXISTS "tagline"              text,
  ADD COLUMN IF NOT EXISTS "profile_image_url"    text,
  ADD COLUMN IF NOT EXISTS "avatar_key"           text,
  ADD COLUMN IF NOT EXISTS "video_links"          text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "tags"                 text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "years_of_experience"  integer;
