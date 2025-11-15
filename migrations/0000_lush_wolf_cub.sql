-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "gigs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"gig_type" text NOT NULL,
	"client_name" text NOT NULL,
	"date" date NOT NULL,
	"expected_pay" numeric(10, 2),
	"actual_pay" numeric(10, 2),
	"payment_method" text,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"duties" text,
	"tax_percentage" integer DEFAULT 23,
	"mileage" integer,
	"notes" text,
	"parking_expense" numeric(10, 2),
	"other_expenses" numeric(10, 2),
	"include_in_resume" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"event_name" text DEFAULT 'Event' NOT NULL,
	"gig_address" text,
	"distance_miles" numeric(8, 2),
	"travel_time_minutes" integer,
	"tips" numeric(10, 2),
	"parking_reimbursed" boolean DEFAULT false,
	"other_expenses_reimbursed" boolean DEFAULT false,
	"start_date" date,
	"end_date" date,
	"is_multi_day" boolean DEFAULT false,
	"multi_day_group_id" text,
	"total_received" numeric(10, 2),
	"reimbursed_parking" numeric(10, 2),
	"reimbursed_other" numeric(10, 2),
	"unreimbursed_parking" numeric(10, 2),
	"unreimbursed_other" numeric(10, 2),
	"got_paid_date" timestamp,
	"parking_description" text,
	"other_expense_description" text
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"target_amount" numeric(10, 2) NOT NULL,
	"current_amount" numeric(10, 2) DEFAULT '0',
	"due_date" date,
	"is_completed" boolean DEFAULT false,
	"goal_duration" text DEFAULT 'monthly' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"actual_earnings" numeric(10, 2) DEFAULT '0',
	"projected_earnings" numeric(10, 2) DEFAULT '0',
	"completed_gigs" integer DEFAULT 0,
	"upcoming_gigs" integer DEFAULT 0,
	"monthly_goal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weekly_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"week_start_date" date NOT NULL,
	"week_end_date" date NOT NULL,
	"actual_earnings" numeric(10, 2) DEFAULT '0',
	"projected_earnings" numeric(10, 2) DEFAULT '0',
	"completed_gigs" integer DEFAULT 0,
	"upcoming_gigs" integer DEFAULT 0,
	"weekly_goal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "yearly_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"year" integer NOT NULL,
	"actual_earnings" numeric(10, 2) DEFAULT '0',
	"projected_earnings" numeric(10, 2) DEFAULT '0',
	"completed_gigs" integer DEFAULT 0,
	"upcoming_gigs" integer DEFAULT 0,
	"yearly_goal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "monthly_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"goal_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weekly_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"week_start_date" date NOT NULL,
	"goal_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "yearly_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"year" integer NOT NULL,
	"goal_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"phone" text,
	"title" text DEFAULT 'Gig Worker',
	"default_tax_percentage" integer DEFAULT 23,
	"custom_gig_types" text[] DEFAULT '{""}',
	"home_address" text,
	CONSTRAINT "auth_users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"client_email" varchar(255),
	"client_address" text,
	"business_name" varchar(255) NOT NULL,
	"business_address" text,
	"business_email" varchar(255),
	"business_phone" varchar(50),
	"invoice_date" date NOT NULL,
	"due_date" date NOT NULL,
	"items" jsonb NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"budget_amount" numeric(10, 2) NOT NULL,
	"actual_amount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"subcategories" text[],
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"subcategory_defaults" jsonb
);
--> statement-breakpoint
CREATE TABLE "allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"gig_id" integer,
	"goal_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"allocation_type" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_export_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_type" varchar NOT NULL,
	"status" varchar NOT NULL,
	"file_path" varchar,
	"expires_at" timestamp,
	"requested_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar NOT NULL,
	"table_name" varchar,
	"record_id" integer,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "backup_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"backup_type" varchar NOT NULL,
	"status" varchar NOT NULL,
	"file_path" varchar,
	"file_size" integer,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "user_sessions_session_id_key" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	CONSTRAINT "password_reset_tokens_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "cached_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"report_type" text NOT NULL,
	"period" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer,
	"pdf_url" text,
	"html_content" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "cached_reports_report_type_check" CHECK (report_type = ANY (ARRAY['professional'::text, 'simple'::text, 'mobile'::text])),
	CONSTRAINT "cached_reports_period_check" CHECK (period = ANY (ARRAY['monthly'::text, 'annual'::text])),
	CONSTRAINT "valid_month" CHECK ((month IS NULL) OR ((month >= 1) AND (month <= 12))),
	CONSTRAINT "valid_year" CHECK ((year >= 2020) AND (year <= 2030)),
	CONSTRAINT "has_content" CHECK ((pdf_url IS NOT NULL) OR (html_content IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "report_generation_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"report_type" text NOT NULL,
	"period" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer,
	"generation_status" text NOT NULL,
	"error_message" text,
	"generation_time_ms" integer,
	"file_size_bytes" integer,
	"cached_used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"request_metadata" jsonb DEFAULT '{}'::jsonb,
	"system_metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "report_generation_log_generation_status_check" CHECK (generation_status = ANY (ARRAY['success'::text, 'failed'::text, 'cached'::text]))
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"amount" varchar(20) NOT NULL,
	"merchant" varchar(255) NOT NULL,
	"business_purpose" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"gig_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"title" text DEFAULT 'Gig Worker',
	"default_tax_percentage" integer DEFAULT 23,
	"custom_gig_types" text[] DEFAULT '{""}',
	"home_address" text,
	"replit_id" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"business_name" text,
	"business_address" text,
	"business_phone" text,
	"business_email" text,
	"google_id" varchar,
	"password_hash" varchar,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"email_verified" boolean DEFAULT false,
	"onboarding_completed" boolean DEFAULT false,
	"notification_preferences" jsonb DEFAULT '{"push":true,"email":true,"reminders":true}'::jsonb,
	"work_preferences" jsonb DEFAULT '{"workingHours":{"end":"17:00","start":"09:00"},"primaryGigTypes":[],"preferredClients":[]}'::jsonb,
	"trial_start_date" timestamp,
	"trial_end_date" timestamp,
	"subscription_status" varchar DEFAULT 'trial',
	"subscription_tier" varchar DEFAULT 'trial',
	"last_login_at" timestamp,
	"bio" text,
	"headshot_urls" text[],
	"resume_url" varchar(500),
	"w2_documents" text[],
	"emergency_notifications" boolean DEFAULT true,
	"preferred_cities" text[],
	"push_tokens" jsonb DEFAULT '[]'::jsonb,
	"revenuecat_customer_id" text,
	"subscription_expires_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_replit_id_key" UNIQUE("replit_id"),
	CONSTRAINT "users_google_id_key" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "ba_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"emergency_gig_id" integer,
	"ba_user_id" integer,
	"applied_at" timestamp DEFAULT now(),
	"email_sent" boolean DEFAULT false,
	CONSTRAINT "ba_applications_emergency_gig_id_ba_user_id_key" UNIQUE("emergency_gig_id","ba_user_id")
);
--> statement-breakpoint
CREATE TABLE "emergency_gigs" (
	"id" serial PRIMARY KEY NOT NULL,
	"agency_email" varchar(255) NOT NULL,
	"agency_name" varchar(255),
	"contact_email" varchar(255) NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"event_date" timestamp NOT NULL,
	"city" varchar(100) NOT NULL,
	"venue" varchar(255),
	"role_description" text,
	"pay_rate" varchar(100),
	"urgency" varchar(50) DEFAULT 'ASAP',
	"status" varchar(20) DEFAULT 'active',
	"revenuecat_transaction_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"filled_at" timestamp,
	"agency_id" integer
);
--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"phone_number" varchar(50),
	"website" varchar(255),
	"description" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agencies_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "monthly_stats" ADD CONSTRAINT "monthly_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_stats" ADD CONSTRAINT "weekly_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yearly_stats" ADD CONSTRAINT "yearly_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yearly_goals" ADD CONSTRAINT "yearly_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_export_requests" ADD CONSTRAINT "data_export_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_gig_id_fkey" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ba_applications" ADD CONSTRAINT "ba_applications_emergency_gig_id_fkey" FOREIGN KEY ("emergency_gig_id") REFERENCES "public"."emergency_gigs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ba_applications" ADD CONSTRAINT "ba_applications_ba_user_id_fkey" FOREIGN KEY ("ba_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_gigs" ADD CONSTRAINT "emergency_gigs_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_gigs_date_status" ON "gigs" USING btree ("date" date_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_gigs_user_date" ON "gigs" USING btree ("user_id" int4_ops,"date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_gigs_user_id" ON "gigs" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_gigs_user_status" ON "gigs" USING btree ("user_id" int4_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_goals_user_id" ON "goals" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_monthly_goals_user_year_month" ON "monthly_goals" USING btree ("user_id" int4_ops,"year" int4_ops,"month" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_yearly_goals_user_year" ON "yearly_goals" USING btree ("user_id" int4_ops,"year" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_session_expire" ON "sessions" USING btree ("expire" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_cached_reports_expires_at" ON "cached_reports" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_cached_reports_type_period" ON "cached_reports" USING btree ("report_type" text_ops,"period" text_ops);--> statement-breakpoint
CREATE INDEX "idx_cached_reports_user_id" ON "cached_reports" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_report_log_created_at" ON "report_generation_log" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_report_log_user_id" ON "report_generation_log" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_agencies_email" ON "agencies" USING btree ("email" text_ops);
*/