ALTER TABLE "instructor_details" ADD COLUMN "rating" real DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "instructor_details" ADD COLUMN "students_guided" integer DEFAULT 0 NOT NULL;