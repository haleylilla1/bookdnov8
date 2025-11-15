import { relations } from "drizzle-orm/relations";
import { users, monthlyStats, weeklyStats, yearlyStats, monthlyGoals, weeklyGoals, yearlyGoals, invoices, budgets, expenseCategories, allocations, dataExportRequests, auditLogs, userSessions, passwordResetTokens, expenses, gigs, emergencyGigs, baApplications, agencies } from "./schema";

export const monthlyStatsRelations = relations(monthlyStats, ({one}) => ({
	user: one(users, {
		fields: [monthlyStats.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	monthlyStats: many(monthlyStats),
	weeklyStats: many(weeklyStats),
	yearlyStats: many(yearlyStats),
	monthlyGoals: many(monthlyGoals),
	weeklyGoals: many(weeklyGoals),
	yearlyGoals: many(yearlyGoals),
	invoices: many(invoices),
	budgets: many(budgets),
	expenseCategories: many(expenseCategories),
	allocations: many(allocations),
	dataExportRequests: many(dataExportRequests),
	auditLogs: many(auditLogs),
	userSessions: many(userSessions),
	passwordResetTokens: many(passwordResetTokens),
	expenses: many(expenses),
	baApplications: many(baApplications),
}));

export const weeklyStatsRelations = relations(weeklyStats, ({one}) => ({
	user: one(users, {
		fields: [weeklyStats.userId],
		references: [users.id]
	}),
}));

export const yearlyStatsRelations = relations(yearlyStats, ({one}) => ({
	user: one(users, {
		fields: [yearlyStats.userId],
		references: [users.id]
	}),
}));

export const monthlyGoalsRelations = relations(monthlyGoals, ({one}) => ({
	user: one(users, {
		fields: [monthlyGoals.userId],
		references: [users.id]
	}),
}));

export const weeklyGoalsRelations = relations(weeklyGoals, ({one}) => ({
	user: one(users, {
		fields: [weeklyGoals.userId],
		references: [users.id]
	}),
}));

export const yearlyGoalsRelations = relations(yearlyGoals, ({one}) => ({
	user: one(users, {
		fields: [yearlyGoals.userId],
		references: [users.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one}) => ({
	user: one(users, {
		fields: [invoices.userId],
		references: [users.id]
	}),
}));

export const budgetsRelations = relations(budgets, ({one}) => ({
	user: one(users, {
		fields: [budgets.userId],
		references: [users.id]
	}),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({one}) => ({
	user: one(users, {
		fields: [expenseCategories.userId],
		references: [users.id]
	}),
}));

export const allocationsRelations = relations(allocations, ({one}) => ({
	user: one(users, {
		fields: [allocations.userId],
		references: [users.id]
	}),
}));

export const dataExportRequestsRelations = relations(dataExportRequests, ({one}) => ({
	user: one(users, {
		fields: [dataExportRequests.userId],
		references: [users.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	user: one(users, {
		fields: [expenses.userId],
		references: [users.id]
	}),
	gig: one(gigs, {
		fields: [expenses.gigId],
		references: [gigs.id]
	}),
}));

export const gigsRelations = relations(gigs, ({many}) => ({
	expenses: many(expenses),
}));

export const baApplicationsRelations = relations(baApplications, ({one}) => ({
	emergencyGig: one(emergencyGigs, {
		fields: [baApplications.emergencyGigId],
		references: [emergencyGigs.id]
	}),
	user: one(users, {
		fields: [baApplications.baUserId],
		references: [users.id]
	}),
}));

export const emergencyGigsRelations = relations(emergencyGigs, ({one, many}) => ({
	baApplications: many(baApplications),
	agency: one(agencies, {
		fields: [emergencyGigs.agencyId],
		references: [agencies.id]
	}),
}));

export const agenciesRelations = relations(agencies, ({many}) => ({
	emergencyGigs: many(emergencyGigs),
}));