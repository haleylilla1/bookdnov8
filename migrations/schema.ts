import { pgTable, index, serial, integer, text, date, numeric, boolean, timestamp, foreignKey, varchar, jsonb, unique, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gigs = pgTable("gigs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	gigType: text("gig_type").notNull(),
	clientName: text("client_name").notNull(),
	date: date().notNull(),
	expectedPay: numeric("expected_pay", { precision: 10, scale:  2 }),
	actualPay: numeric("actual_pay", { precision: 10, scale:  2 }),
	paymentMethod: text("payment_method"),
	status: text().default('upcoming').notNull(),
	duties: text(),
	taxPercentage: integer("tax_percentage").default(23),
	mileage: integer(),
	notes: text(),
	parkingExpense: numeric("parking_expense", { precision: 10, scale:  2 }),
	otherExpenses: numeric("other_expenses", { precision: 10, scale:  2 }),
	includeInResume: boolean("include_in_resume").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	eventName: text("event_name").default('Event').notNull(),
	gigAddress: text("gig_address"),
	distanceMiles: numeric("distance_miles", { precision: 8, scale:  2 }),
	travelTimeMinutes: integer("travel_time_minutes"),
	tips: numeric({ precision: 10, scale:  2 }),
	parkingReimbursed: boolean("parking_reimbursed").default(false),
	otherExpensesReimbursed: boolean("other_expenses_reimbursed").default(false),
	startDate: date("start_date"),
	endDate: date("end_date"),
	isMultiDay: boolean("is_multi_day").default(false),
	multiDayGroupId: text("multi_day_group_id"),
	totalReceived: numeric("total_received", { precision: 10, scale:  2 }),
	reimbursedParking: numeric("reimbursed_parking", { precision: 10, scale:  2 }),
	reimbursedOther: numeric("reimbursed_other", { precision: 10, scale:  2 }),
	unreimbursedParking: numeric("unreimbursed_parking", { precision: 10, scale:  2 }),
	unreimbursedOther: numeric("unreimbursed_other", { precision: 10, scale:  2 }),
	gotPaidDate: timestamp("got_paid_date", { mode: 'string' }),
	parkingDescription: text("parking_description"),
	otherExpenseDescription: text("other_expense_description"),
}, (table) => [
	index("idx_gigs_date_status").using("btree", table.date.asc().nullsLast().op("date_ops"), table.status.asc().nullsLast().op("text_ops")),
	index("idx_gigs_user_date").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast().op("date_ops")),
	index("idx_gigs_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("idx_gigs_user_status").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.status.asc().nullsLast().op("text_ops")),
]);

export const goals = pgTable("goals", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	category: text().notNull(),
	name: text().notNull(),
	targetAmount: numeric("target_amount", { precision: 10, scale:  2 }).notNull(),
	currentAmount: numeric("current_amount", { precision: 10, scale:  2 }).default('0'),
	dueDate: date("due_date"),
	isCompleted: boolean("is_completed").default(false),
	goalDuration: text("goal_duration").default('monthly').notNull(),
}, (table) => [
	index("idx_goals_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
]);

export const monthlyStats = pgTable("monthly_stats", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	actualEarnings: numeric("actual_earnings", { precision: 10, scale:  2 }).default('0'),
	projectedEarnings: numeric("projected_earnings", { precision: 10, scale:  2 }).default('0'),
	completedGigs: integer("completed_gigs").default(0),
	upcomingGigs: integer("upcoming_gigs").default(0),
	monthlyGoal: numeric("monthly_goal", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "monthly_stats_user_id_users_id_fk"
		}),
]);

export const weeklyStats = pgTable("weekly_stats", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	weekStartDate: date("week_start_date").notNull(),
	weekEndDate: date("week_end_date").notNull(),
	actualEarnings: numeric("actual_earnings", { precision: 10, scale:  2 }).default('0'),
	projectedEarnings: numeric("projected_earnings", { precision: 10, scale:  2 }).default('0'),
	completedGigs: integer("completed_gigs").default(0),
	upcomingGigs: integer("upcoming_gigs").default(0),
	weeklyGoal: numeric("weekly_goal", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "weekly_stats_user_id_users_id_fk"
		}),
]);

export const yearlyStats = pgTable("yearly_stats", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	year: integer().notNull(),
	actualEarnings: numeric("actual_earnings", { precision: 10, scale:  2 }).default('0'),
	projectedEarnings: numeric("projected_earnings", { precision: 10, scale:  2 }).default('0'),
	completedGigs: integer("completed_gigs").default(0),
	upcomingGigs: integer("upcoming_gigs").default(0),
	yearlyGoal: numeric("yearly_goal", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "yearly_stats_user_id_users_id_fk"
		}),
]);

export const monthlyGoals = pgTable("monthly_goals", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	goalAmount: numeric("goal_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_monthly_goals_user_year_month").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops"), table.month.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "monthly_goals_user_id_users_id_fk"
		}),
]);

export const weeklyGoals = pgTable("weekly_goals", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	weekStartDate: date("week_start_date").notNull(),
	goalAmount: numeric("goal_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "weekly_goals_user_id_users_id_fk"
		}),
]);

export const yearlyGoals = pgTable("yearly_goals", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	year: integer().notNull(),
	goalAmount: numeric("goal_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_yearly_goals_user_year").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "yearly_goals_user_id_users_id_fk"
		}),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("idx_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const authUsers = pgTable("auth_users", {
	id: varchar().primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	phone: text(),
	title: text().default('Gig Worker'),
	defaultTaxPercentage: integer("default_tax_percentage").default(23),
	customGigTypes: text("custom_gig_types").array().default([""]),
	homeAddress: text("home_address"),
}, (table) => [
	unique("auth_users_email_key").on(table.email),
]);

export const invoices = pgTable("invoices", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
	clientName: varchar("client_name", { length: 255 }).notNull(),
	clientEmail: varchar("client_email", { length: 255 }),
	clientAddress: text("client_address"),
	businessName: varchar("business_name", { length: 255 }).notNull(),
	businessAddress: text("business_address"),
	businessEmail: varchar("business_email", { length: 255 }),
	businessPhone: varchar("business_phone", { length: 50 }),
	invoiceDate: date("invoice_date").notNull(),
	dueDate: date("due_date").notNull(),
	items: jsonb().notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	taxRate: numeric("tax_rate", { precision: 5, scale:  2 }).default('0').notNull(),
	taxAmount: numeric("tax_amount", { precision: 10, scale:  2 }).default('0').notNull(),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	notes: text(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "invoices_user_id_fkey"
		}),
]);

export const budgets = pgTable("budgets", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	category: text().notNull(),
	subcategory: text(),
	budgetAmount: numeric("budget_amount", { precision: 10, scale:  2 }).notNull(),
	actualAmount: numeric("actual_amount", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "budgets_user_id_fkey"
		}),
]);

export const expenseCategories = pgTable("expense_categories", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: text().notNull(),
	subcategories: text().array(),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	subcategoryDefaults: jsonb("subcategory_defaults"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "expense_categories_user_id_fkey"
		}),
]);

export const allocations = pgTable("allocations", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	gigId: integer("gig_id"),
	goalId: integer("goal_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	allocationType: text("allocation_type").notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "allocations_user_id_fkey"
		}),
]);

export const dataExportRequests = pgTable("data_export_requests", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	requestType: varchar("request_type").notNull(),
	status: varchar().notNull(),
	filePath: varchar("file_path"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	requestedAt: timestamp("requested_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "data_export_requests_user_id_fkey"
		}),
]);

export const auditLogs = pgTable("audit_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	action: varchar().notNull(),
	tableName: varchar("table_name"),
	recordId: integer("record_id"),
	oldValues: jsonb("old_values"),
	newValues: jsonb("new_values"),
	ipAddress: varchar("ip_address"),
	userAgent: varchar("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_fkey"
		}),
]);

export const backupLogs = pgTable("backup_logs", {
	id: serial().primaryKey().notNull(),
	backupType: varchar("backup_type").notNull(),
	status: varchar().notNull(),
	filePath: varchar("file_path"),
	fileSize: integer("file_size"),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	errorMessage: text("error_message"),
});

export const userSessions = pgTable("user_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	sessionId: varchar("session_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	ipAddress: varchar("ip_address"),
	userAgent: text("user_agent"),
	isActive: boolean("is_active").default(true),
}, (table) => [
	index("idx_user_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_fkey"
		}),
	unique("user_sessions_session_id_key").on(table.sessionId),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: varchar().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	used: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_fkey"
		}),
	unique("password_reset_tokens_token_key").on(table.token),
]);

export const cachedReports = pgTable("cached_reports", {
	id: text().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	reportType: text("report_type").notNull(),
	period: text().notNull(),
	year: integer().notNull(),
	month: integer(),
	pdfUrl: text("pdf_url"),
	htmlContent: text("html_content"),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("idx_cached_reports_expires_at").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_cached_reports_type_period").using("btree", table.reportType.asc().nullsLast().op("text_ops"), table.period.asc().nullsLast().op("text_ops")),
	index("idx_cached_reports_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	check("cached_reports_report_type_check", sql`report_type = ANY (ARRAY['professional'::text, 'simple'::text, 'mobile'::text])`),
	check("cached_reports_period_check", sql`period = ANY (ARRAY['monthly'::text, 'annual'::text])`),
	check("valid_month", sql`(month IS NULL) OR ((month >= 1) AND (month <= 12))`),
	check("valid_year", sql`(year >= 2020) AND (year <= 2030)`),
	check("has_content", sql`(pdf_url IS NOT NULL) OR (html_content IS NOT NULL)`),
]);

export const reportGenerationLog = pgTable("report_generation_log", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	reportType: text("report_type").notNull(),
	period: text().notNull(),
	year: integer().notNull(),
	month: integer(),
	generationStatus: text("generation_status").notNull(),
	errorMessage: text("error_message"),
	generationTimeMs: integer("generation_time_ms"),
	fileSizeBytes: integer("file_size_bytes"),
	cachedUsed: boolean("cached_used").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	requestMetadata: jsonb("request_metadata").default({}),
	systemMetadata: jsonb("system_metadata").default({}),
}, (table) => [
	index("idx_report_log_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_report_log_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	check("report_generation_log_generation_status_check", sql`generation_status = ANY (ARRAY['success'::text, 'failed'::text, 'cached'::text])`),
]);

export const expenses = pgTable("expenses", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	date: varchar({ length: 10 }).notNull(),
	amount: varchar({ length: 20 }).notNull(),
	merchant: varchar({ length: 255 }).notNull(),
	businessPurpose: text("business_purpose").notNull(),
	category: varchar({ length: 100 }).notNull(),
	gigId: integer("gig_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "expenses_user_id_fkey"
		}),
	foreignKey({
			columns: [table.gigId],
			foreignColumns: [gigs.id],
			name: "expenses_gig_id_fkey"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	title: text().default('Gig Worker'),
	defaultTaxPercentage: integer("default_tax_percentage").default(23),
	customGigTypes: text("custom_gig_types").array().default([""]),
	homeAddress: text("home_address"),
	replitId: varchar("replit_id"),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	businessName: text("business_name"),
	businessAddress: text("business_address"),
	businessPhone: text("business_phone"),
	businessEmail: text("business_email"),
	googleId: varchar("google_id"),
	passwordHash: varchar("password_hash"),
	isActive: boolean("is_active").default(true),
	isDeleted: boolean("is_deleted").default(false),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	emailVerified: boolean("email_verified").default(false),
	onboardingCompleted: boolean("onboarding_completed").default(false),
	notificationPreferences: jsonb("notification_preferences").default({"push":true,"email":true,"reminders":true}),
	workPreferences: jsonb("work_preferences").default({"workingHours":{"end":"17:00","start":"09:00"},"primaryGigTypes":[],"preferredClients":[]}),
	trialStartDate: timestamp("trial_start_date", { mode: 'string' }),
	trialEndDate: timestamp("trial_end_date", { mode: 'string' }),
	subscriptionStatus: varchar("subscription_status").default('trial'),
	subscriptionTier: varchar("subscription_tier").default('trial'),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	bio: text(),
	headshotUrls: text("headshot_urls").array(),
	resumeUrl: varchar("resume_url", { length: 500 }),
	w2Documents: text("w2_documents").array(),
	emergencyNotifications: boolean("emergency_notifications").default(true),
	preferredCities: text("preferred_cities").array(),
	pushTokens: jsonb("push_tokens").default([]),
	revenuecatCustomerId: text("revenuecat_customer_id"),
	subscriptionExpiresAt: timestamp("subscription_expires_at", { mode: 'string' }),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_replit_id_key").on(table.replitId),
	unique("users_google_id_key").on(table.googleId),
]);

export const baApplications = pgTable("ba_applications", {
	id: serial().primaryKey().notNull(),
	emergencyGigId: integer("emergency_gig_id"),
	baUserId: integer("ba_user_id"),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
	emailSent: boolean("email_sent").default(false),
}, (table) => [
	foreignKey({
			columns: [table.emergencyGigId],
			foreignColumns: [emergencyGigs.id],
			name: "ba_applications_emergency_gig_id_fkey"
		}),
	foreignKey({
			columns: [table.baUserId],
			foreignColumns: [users.id],
			name: "ba_applications_ba_user_id_fkey"
		}),
	unique("ba_applications_emergency_gig_id_ba_user_id_key").on(table.emergencyGigId, table.baUserId),
]);

export const emergencyGigs = pgTable("emergency_gigs", {
	id: serial().primaryKey().notNull(),
	agencyEmail: varchar("agency_email", { length: 255 }).notNull(),
	agencyName: varchar("agency_name", { length: 255 }),
	contactEmail: varchar("contact_email", { length: 255 }).notNull(),
	eventName: varchar("event_name", { length: 255 }).notNull(),
	eventDate: timestamp("event_date", { mode: 'string' }).notNull(),
	city: varchar({ length: 100 }).notNull(),
	venue: varchar({ length: 255 }),
	roleDescription: text("role_description"),
	payRate: varchar("pay_rate", { length: 100 }),
	urgency: varchar({ length: 50 }).default('ASAP'),
	status: varchar({ length: 20 }).default('active'),
	revenuecatTransactionId: varchar("revenuecat_transaction_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	filledAt: timestamp("filled_at", { mode: 'string' }),
	agencyId: integer("agency_id"),
}, (table) => [
	foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "emergency_gigs_agency_id_fkey"
		}),
]);

export const agencies = pgTable("agencies", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	contactName: varchar("contact_name", { length: 255 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 50 }),
	website: varchar({ length: 255 }),
	description: text(),
	isVerified: boolean("is_verified").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_agencies_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("agencies_email_key").on(table.email),
]);
