ALTER TABLE "rabbit_holes" ADD COLUMN "spark" text;--> statement-breakpoint
ALTER TABLE "rabbit_holes" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "rabbit_holes" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;