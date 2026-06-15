CREATE TABLE "flags" (
	"user_id" uuid NOT NULL,
	"hole_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flags_user_id_hole_id_pk" PRIMARY KEY("user_id","hole_id")
);
--> statement-breakpoint
ALTER TABLE "flags" ADD CONSTRAINT "flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flags" ADD CONSTRAINT "flags_hole_id_rabbit_holes_id_fk" FOREIGN KEY ("hole_id") REFERENCES "public"."rabbit_holes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flags_hole_id_idx" ON "flags" USING btree ("hole_id");