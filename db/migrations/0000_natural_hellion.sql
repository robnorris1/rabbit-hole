CREATE TYPE "public"."hole_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('compiling', 'sent_to_print', 'shipped');--> statement-breakpoint
CREATE TYPE "public"."pro_status" AS ENUM('inactive', 'active', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TABLE "book_issue_holes" (
	"issue_id" uuid NOT NULL,
	"hole_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"upvote_snapshot" integer NOT NULL,
	CONSTRAINT "book_issue_holes_issue_id_hole_id_pk" PRIMARY KEY("issue_id","hole_id")
);
--> statement-breakpoint
CREATE TABLE "book_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_number" integer NOT NULL,
	"season" text NOT NULL,
	"status" "issue_status" DEFAULT 'compiling' NOT NULL,
	"cutoff_date" date NOT NULL,
	"shipped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "book_issues_issue_number_unique" UNIQUE("issue_number")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "rabbit_holes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"body" text DEFAULT '' NOT NULL,
	"read_time_mins" integer DEFAULT 1 NOT NULL,
	"status" "hole_status" DEFAULT 'draft' NOT NULL,
	"upvote_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rabbit_holes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "upvotes" (
	"user_id" uuid NOT NULL,
	"hole_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "upvotes_user_id_hole_id_pk" PRIMARY KEY("user_id","hole_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cognito_sub" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"pro_status" "pro_status" DEFAULT 'inactive' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_cognito_sub_unique" UNIQUE("cognito_sub"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "users_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "book_issue_holes" ADD CONSTRAINT "book_issue_holes_issue_id_book_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."book_issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_issue_holes" ADD CONSTRAINT "book_issue_holes_hole_id_rabbit_holes_id_fk" FOREIGN KEY ("hole_id") REFERENCES "public"."rabbit_holes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rabbit_holes" ADD CONSTRAINT "rabbit_holes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_hole_id_rabbit_holes_id_fk" FOREIGN KEY ("hole_id") REFERENCES "public"."rabbit_holes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "rabbit_holes_author_id_idx" ON "rabbit_holes" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "rabbit_holes_status_published_at_idx" ON "rabbit_holes" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "upvotes_hole_id_idx" ON "upvotes" USING btree ("hole_id");