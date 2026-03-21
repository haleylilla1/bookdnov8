import { db } from './db';
import { users, gigs, expenses, goals } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import * as archiver from 'archiver';
import ExcelJS from 'exceljs';

export interface UserBackupData {
  user: any;
  gigs: any[];
  expenses: any[];
  goals: any[];
  exportDate: string;
  version: string;
}

export class BackupManager {
  private backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a complete backup of a user's data
   */
  async createUserBackup(userId: number): Promise<UserBackupData> {
    try {
      // Fetch all user data
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const [userGigs, userExpenses, userGoals] = await Promise.all([
        db.select().from(gigs).where(eq(gigs.userId, userId)),
        db.select().from(expenses).where(eq(expenses.userId, userId)),
        db.select().from(goals).where(eq(goals.userId, userId))
      ]);

      const backupData: UserBackupData = {
        user: {
          ...user,
          // Remove sensitive fields
          password: '[REDACTED]'
        },
        gigs: userGigs,
        expenses: userExpenses,
        goals: userGoals,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      return backupData;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Export user data as downloadable JSON file
   */
  async exportUserData(userId: number): Promise<string> {
    const backupData = await this.createUserBackup(userId);
    const filename = `bookd-export-${userId}-${Date.now()}.json`;
    const filepath = path.join(this.backupDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
    
    return filepath;
  }

  /**
   * Export user data as Excel workbook
   */
  async exportUserDataAsExcel(userId: number): Promise<string> {
    const backupData = await this.createUserBackup(userId);
    const filename = `bookd-export-${userId}-${Date.now()}.xlsx`;
    const filepath = path.join(this.backupDir, filename);

    const workbook = new ExcelJS.Workbook();

    // User Profile Sheet
    const profileSheet = workbook.addWorksheet('Profile');
    profileSheet.columns = [
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Title', key: 'title' },
      { header: 'Default Tax Rate (%)', key: 'taxRate' },
      { header: 'Home Address', key: 'homeAddress' },
      { header: 'Business Name', key: 'businessName' },
      { header: 'Business Address', key: 'businessAddress' },
      { header: 'Business Phone', key: 'businessPhone' },
      { header: 'Business Email', key: 'businessEmail' },
      { header: 'Export Date', key: 'exportDate' },
      { header: 'Data Version', key: 'version' },
    ];
    profileSheet.addRow({
      name: backupData.user.name,
      email: backupData.user.email,
      phone: backupData.user.phone || '',
      title: backupData.user.title || 'Gig Worker',
      taxRate: backupData.user.defaultTaxPercentage || 23,
      homeAddress: backupData.user.homeAddress || '',
      businessName: backupData.user.businessName || '',
      businessAddress: backupData.user.businessAddress || '',
      businessPhone: backupData.user.businessPhone || '',
      businessEmail: backupData.user.businessEmail || '',
      exportDate: backupData.exportDate,
      version: backupData.version,
    });

    // Gigs Sheet
    if (backupData.gigs.length > 0) {
      const gigsSheet = workbook.addWorksheet('Gigs');
      gigsSheet.columns = [
        { header: 'Date', key: 'date' },
        { header: 'Client', key: 'client' },
        { header: 'Gig Type', key: 'gigType' },
        { header: 'Location', key: 'location' },
        { header: 'Status', key: 'status' },
        { header: 'Amount Expected ($)', key: 'amountExpected' },
        { header: 'Amount Received ($)', key: 'amountReceived' },
        { header: 'Parking Reimbursed ($)', key: 'parkingReimbursed' },
        { header: 'Other Reimbursed ($)', key: 'otherReimbursed' },
        { header: 'Parking Expense ($)', key: 'parkingExpense' },
        { header: 'Other Expenses ($)', key: 'otherExpenses' },
        { header: 'Mileage', key: 'mileage' },
        { header: 'Notes', key: 'notes' },
        { header: 'Created', key: 'created' },
      ];
      for (const gig of backupData.gigs) {
        gigsSheet.addRow({
          date: gig.date,
          client: gig.clientName || '',
          gigType: gig.gigType || '',
          location: gig.location || '',
          status: gig.status || 'pending',
          amountExpected: gig.amount ? parseFloat(gig.amount) : 0,
          amountReceived: gig.totalReceived ? parseFloat(gig.totalReceived) : 0,
          parkingReimbursed: gig.reimbursedParking ? parseFloat(gig.reimbursedParking) : 0,
          otherReimbursed: gig.reimbursedOther ? parseFloat(gig.reimbursedOther) : 0,
          parkingExpense: gig.unreimbursedParking ? parseFloat(gig.unreimbursedParking) : 0,
          otherExpenses: gig.unreimbursedOther ? parseFloat(gig.unreimbursedOther) : 0,
          mileage: gig.mileage || 0,
          notes: gig.notes || '',
          created: gig.createdAt,
        });
      }
    }

    // Expenses Sheet
    if (backupData.expenses.length > 0) {
      const expensesSheet = workbook.addWorksheet('Expenses');
      expensesSheet.columns = [
        { header: 'Date', key: 'date' },
        { header: 'Category', key: 'category' },
        { header: 'Description', key: 'description' },
        { header: 'Amount ($)', key: 'amount' },
        { header: 'Receipt', key: 'receipt' },
        { header: 'Business Related', key: 'businessRelated' },
        { header: 'Tax Deductible', key: 'taxDeductible' },
        { header: 'Notes', key: 'notes' },
        { header: 'Created', key: 'created' },
      ];
      for (const expense of backupData.expenses) {
        expensesSheet.addRow({
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: expense.amount ? parseFloat(expense.amount) : 0,
          receipt: expense.receiptUrl ? 'Yes' : 'No',
          businessRelated: expense.isBusinessExpense ? 'Yes' : 'No',
          taxDeductible: expense.isTaxDeductible ? 'Yes' : 'No',
          notes: expense.notes || '',
          created: expense.createdAt,
        });
      }
    }

    // Goals Sheet
    if (backupData.goals.length > 0) {
      const goalsSheet = workbook.addWorksheet('Goals');
      goalsSheet.columns = [
        { header: 'Month', key: 'month' },
        { header: 'Year', key: 'year' },
        { header: 'Goal Amount ($)', key: 'goalAmount' },
        { header: 'Created', key: 'created' },
        { header: 'Updated', key: 'updated' },
      ];
      for (const goal of backupData.goals) {
        goalsSheet.addRow({
          month: goal.month,
          year: goal.year,
          goalAmount: goal.goalAmount ? parseFloat(goal.goalAmount) : 0,
          created: goal.createdAt,
          updated: goal.updatedAt,
        });
      }
    }

    // Summary Sheet
    const totalGigIncome = backupData.gigs.reduce((sum, gig) =>
      sum + (gig.totalReceived ? parseFloat(gig.totalReceived) : 0), 0);
    const totalExpenses = backupData.expenses.reduce((sum, expense) =>
      sum + (expense.amount ? parseFloat(expense.amount) : 0), 0);
    const totalMileage = backupData.gigs.reduce((sum, gig) =>
      sum + (gig.mileage || 0), 0);

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Total Gigs', key: 'totalGigs' },
      { header: 'Total Income ($)', key: 'totalIncome' },
      { header: 'Total Expenses ($)', key: 'totalExpenses' },
      { header: 'Net Income ($)', key: 'netIncome' },
      { header: 'Total Mileage', key: 'totalMileage' },
      { header: 'Export Date', key: 'exportDate' },
      { header: 'Tax Year', key: 'taxYear' },
    ];
    summarySheet.addRow({
      totalGigs: backupData.gigs.length,
      totalIncome: totalGigIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netIncome: (totalGigIncome - totalExpenses).toFixed(2),
      totalMileage,
      exportDate: backupData.exportDate,
      taxYear: new Date().getFullYear(),
    });

    await workbook.xlsx.writeFile(filepath);

    return filepath;
  }

  /**
   * Create compressed backup archive
   */
  async createBackupArchive(userId: number): Promise<string> {
    const backupData = await this.createUserBackup(userId);
    const filename = `bookd-backup-${userId}-${Date.now()}.zip`;
    const filepath = path.join(this.backupDir, filename);
    
    return new Promise((resolve, reject) => {
      const output = createWriteStream(filepath);
      const archive = archiver.default('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        console.log(`📦 Backup archive created: ${filepath} (${archive.pointer()} bytes)`);
        resolve(filepath);
      });
      
      archive.on('error', reject);
      archive.pipe(output);
      
      // Add JSON data to archive
      archive.append(JSON.stringify(backupData, null, 2), { name: 'backup.json' });
      
      // Add metadata
      archive.append(JSON.stringify({
        exportDate: new Date().toISOString(),
        userId,
        recordCounts: {
          gigs: backupData.gigs.length,
          expenses: backupData.expenses.length,
          goals: backupData.goals.length
        }
      }, null, 2), { name: 'metadata.json' });
      
      archive.finalize();
    });
  }

  /**
   * Validate backup data integrity
   */
  async validateBackup(backupData: UserBackupData): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Check required fields
    if (!backupData.user || !backupData.user.id) {
      errors.push('Missing user data');
    }
    
    if (!Array.isArray(backupData.gigs)) {
      errors.push('Invalid gigs data');
    }
    
    if (!Array.isArray(backupData.expenses)) {
      errors.push('Invalid expenses data');
    }
    
    if (!backupData.exportDate) {
      errors.push('Missing export date');
    }
    
    // Check data consistency
    const userId = backupData.user?.id;
    if (userId) {
      const invalidGigs = backupData.gigs.filter(gig => gig.userId !== userId);
      if (invalidGigs.length > 0) {
        errors.push(`${invalidGigs.length} gigs belong to different user`);
      }
      
      const invalidExpenses = backupData.expenses.filter(expense => expense.userId !== userId);
      if (invalidExpenses.length > 0) {
        errors.push(`${invalidExpenses.length} expenses belong to different user`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Restore user data from backup (DANGEROUS - USE WITH CAUTION)
   */
  async restoreUserData(backupData: UserBackupData, targetUserId: number): Promise<void> {
    console.log(`⚠️  RESTORE OPERATION: Restoring data for user ${targetUserId}`);
    
    // Validate backup first
    const validation = await this.validateBackup(backupData);
    if (!validation.valid) {
      throw new Error(`Invalid backup data: ${validation.errors.join(', ')}`);
    }
    
    try {
      // Begin transaction-like operations
      console.log('🔄 Starting restore process...');
      
      // Clear existing data (DANGEROUS)
      await Promise.all([
        db.delete(gigs).where(eq(gigs.userId, targetUserId)),
        db.delete(expenses).where(eq(expenses.userId, targetUserId)),
        db.delete(goals).where(eq(goals.userId, targetUserId))
      ]);
      
      console.log('🗑️  Cleared existing data');
      
      // Restore data with updated user IDs
      const restorePromises = [];
      
      if (backupData.gigs.length > 0) {
        const gigsToRestore = backupData.gigs.map(gig => ({ ...gig, userId: targetUserId }));
        restorePromises.push(db.insert(gigs).values(gigsToRestore));
      }
      
      if (backupData.expenses.length > 0) {
        const expensesToRestore = backupData.expenses.map(expense => ({ ...expense, userId: targetUserId }));
        restorePromises.push(db.insert(expenses).values(expensesToRestore));
      }
      
      if (backupData.goals.length > 0) {
        const goalsToRestore = backupData.goals.map(goal => ({ ...goal, userId: targetUserId }));
        restorePromises.push(db.insert(goals).values(goalsToRestore));
      }
      

      
      await Promise.all(restorePromises);
      
      console.log(`✅ Restore completed for user ${targetUserId}`);
      console.log(`📊 Restored: ${backupData.gigs.length} gigs, ${backupData.expenses.length} expenses, ${backupData.goals.length} goals`);
      
    } catch (error) {
      console.error(`❌ Restore failed for user ${targetUserId}:`, error);
      throw error;
    }
  }

  /**
   * Get backup directory info and cleanup old backups
   */
  async getBackupInfo(): Promise<{ totalFiles: number; totalSize: number; oldestBackup: string | null }> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(f => f.includes('bookd-backup-') || f.includes('bookd-export-'));
      
      let totalSize = 0;
      let oldestBackup: string | null = null;
      let oldestTime = Infinity;
      
      for (const file of backupFiles) {
        const filepath = path.join(this.backupDir, file);
        const stats = await fs.stat(filepath);
        totalSize += stats.size;
        
        if (stats.mtime.getTime() < oldestTime) {
          oldestTime = stats.mtime.getTime();
          oldestBackup = file;
        }
      }
      
      return {
        totalFiles: backupFiles.length,
        totalSize,
        oldestBackup
      };
    } catch {
      return { totalFiles: 0, totalSize: 0, oldestBackup: null };
    }
  }

  /**
   * Cleanup old backup files (keep last 10 per user)
   */
  async cleanupOldBackups(maxFiles: number = 10): Promise<number> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(f => f.includes('bookd-backup-') || f.includes('bookd-export-'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: parseInt(f.split('-').pop()?.split('.')[0] || '0')
        }))
        .sort((a, b) => b.time - a.time);
      
      const filesToDelete = backupFiles.slice(maxFiles);
      
      for (const file of filesToDelete) {
        await fs.unlink(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      }
      
      return filesToDelete.length;
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      return 0;
    }
  }
}

export const backupManager = new BackupManager();