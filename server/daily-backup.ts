/**
 * DAILY DATABASE BACKUP SCRIPT
 * 
 * This script creates a complete backup of ALL user data every day.
 * Run this daily at 2 AM using a cron job or scheduled task.
 * 
 * Usage:
 *   npm run backup:daily
 * 
 * Or via cron (add to your crontab):
 *   0 2 * * * cd /path/to/bookd && npm run backup:daily >> /var/log/bookd-backup.log 2>&1
 */

import { db } from './db';
import { users, gigs, expenses, goals, budgets, allocations } from '../shared/schema';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import * as archiver from 'archiver';

interface DailyBackupData {
  timestamp: string;
  version: string;
  stats: {
    totalUsers: number;
    totalGigs: number;
    totalExpenses: number;
    totalGoals: number;
    totalBudgets: number;
    totalAllocations: number;
  };
  data: {
    users: any[];
    gigs: any[];
    expenses: any[];
    goals: any[];
    budgets: any[];
    allocations: any[];
  };
}

async function createDailyBackup(): Promise<void> {
  console.log('🔄 Starting daily backup...');
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  
  try {
    // Create backups directory
    const backupDir = path.join(process.cwd(), 'backups', 'daily');
    await fs.mkdir(backupDir, { recursive: true });

    // Fetch ALL data from database
    console.log('📊 Fetching data from database...');
    const [allUsers, allGigs, allExpenses, allGoals, allBudgets, allAllocations] = await Promise.all([
      db.select().from(users),
      db.select().from(gigs),
      db.select().from(expenses),
      db.select().from(goals),
      db.select().from(budgets),
      db.select().from(allocations),
    ]);

    console.log(`   Users: ${allUsers.length}`);
    console.log(`   Gigs: ${allGigs.length}`);
    console.log(`   Expenses: ${allExpenses.length}`);
    console.log(`   Goals: ${allGoals.length}`);
    console.log(`   Budgets: ${allBudgets.length}`);
    console.log(`   Allocations: ${allAllocations.length}`);

    // Sanitize sensitive data (remove password hashes)
    const sanitizedUsers = allUsers.map(user => ({
      ...user,
      passwordHash: '[REDACTED]', // Don't backup passwords
    }));

    // Create backup object
    const backup: DailyBackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      stats: {
        totalUsers: allUsers.length,
        totalGigs: allGigs.length,
        totalExpenses: allExpenses.length,
        totalGoals: allGoals.length,
        totalBudgets: allBudgets.length,
        totalAllocations: allAllocations.length,
      },
      data: {
        users: sanitizedUsers,
        gigs: allGigs,
        expenses: allExpenses,
        goals: allGoals,
        budgets: allBudgets,
        allocations: allAllocations,
      },
    };

    // Save as JSON
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const jsonFilename = `backup_${dateStr}.json`;
    const jsonPath = path.join(backupDir, jsonFilename);
    
    console.log('💾 Writing JSON backup...');
    await fs.writeFile(jsonPath, JSON.stringify(backup, null, 2));
    console.log(`✅ JSON backup saved: ${jsonPath}`);

    // Create compressed ZIP archive
    const zipFilename = `backup_${dateStr}.zip`;
    const zipPath = path.join(backupDir, zipFilename);
    
    console.log('📦 Creating ZIP archive...');
    await createZipArchive(backup, zipPath);
    console.log(`✅ ZIP backup saved: ${zipPath}`);

    // Get file sizes
    const jsonStats = await fs.stat(jsonPath);
    const zipStats = await fs.stat(zipPath);
    const compressionRatio = ((1 - (zipStats.size / jsonStats.size)) * 100).toFixed(1);
    
    console.log(`📊 Backup sizes:`);
    console.log(`   JSON: ${(jsonStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ZIP: ${(zipStats.size / 1024 / 1024).toFixed(2)} MB (${compressionRatio}% compression)`);

    // Cleanup old backups (keep last 90 days)
    console.log('🧹 Cleaning up old backups...');
    const deleted = await cleanupOldBackups(backupDir, 90);
    console.log(`🗑️  Deleted ${deleted} old backup(s)`);

    console.log('✅ Daily backup complete!');
    console.log('');

  } catch (error) {
    console.error('❌ Daily backup FAILED:', error);
    throw error;
  }
}

async function createZipArchive(backup: DailyBackupData, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver.default('zip', { zlib: { level: 9 } }); // Maximum compression

    output.on('close', () => resolve());
    archive.on('error', reject);
    
    archive.pipe(output);
    
    // Add backup data
    archive.append(JSON.stringify(backup, null, 2), { name: 'backup.json' });
    
    // Add metadata
    archive.append(JSON.stringify({
      backupDate: backup.timestamp,
      version: backup.version,
      stats: backup.stats,
      notes: 'Daily automated backup of Bookd database'
    }, null, 2), { name: 'metadata.json' });
    
    // Add README
    archive.append(`
BOOKD DAILY BACKUP
==================
Backup Date: ${new Date(backup.timestamp).toLocaleString()}
Total Users: ${backup.stats.totalUsers}
Total Gigs: ${backup.stats.totalGigs}
Total Expenses: ${backup.stats.totalExpenses}

This backup contains ALL user data from the Bookd database.
To restore, contact your system administrator.

Files included:
- backup.json: Full database export
- metadata.json: Backup statistics
    `.trim(), { name: 'README.txt' });
    
    archive.finalize();
  });
}

async function cleanupOldBackups(backupDir: string, daysToKeep: number): Promise<number> {
  try {
    const files = await fs.readdir(backupDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const file of files) {
      if (file.startsWith('backup_') && (file.endsWith('.json') || file.endsWith('.zip'))) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`   🗑️  Deleted: ${file}`);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('⚠️  Cleanup error:', error);
    return 0;
  }
}

// Run if executed directly
if (require.main === module) {
  createDailyBackup()
    .then(() => {
      console.log('✅ Backup script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backup script failed:', error);
      process.exit(1);
    });
}

export { createDailyBackup };
