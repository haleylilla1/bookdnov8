/**
 * Currency Data Cleanup Script
 * 
 * Fixes currency values corrupted by iOS Safari type="number" scroll bug
 * (e.g., 800 → 797, 800 → 799)
 * 
 * Normalizes all currency fields to 2-decimal format (e.g., "800.00")
 */

import { db } from '../server/db';
import { gigs, expenses } from '../shared/schema';
import { sql } from 'drizzle-orm';
import { sanitizeCurrency } from '../shared/validation';

async function fixCurrencyData() {
  console.log('🔧 Starting currency data cleanup...\n');

  try {
    // Fetch all gigs
    const allGigs = await db.select().from(gigs);
    console.log(`📊 Found ${allGigs.length} gigs to check\n`);

    let gigsFixed = 0;
    let fieldsFixed = 0;

    // Process each gig
    for (const gig of allGigs) {
      const updates: any = {};
      let gigHasIssues = false;

      // Check and fix each currency field
      const currencyFields = [
        'expectedPay',
        'actualPay',
        'tips',
        'parkingExpense',
        'otherExpenses',
        'totalReceived',
        'reimbursedParking',
        'reimbursedOther',
        'unreimbursedParking',
        'unreimbursedOther'
      ];

      for (const field of currencyFields) {
        const value = gig[field as keyof typeof gig];
        if (value !== null && value !== undefined) {
          const strValue = String(value);
          const normalized = sanitizeCurrency(strValue);

          // Check if normalization changed the value
          if (strValue !== normalized) {
            console.log(`  📝 Gig #${gig.id} (${gig.eventName}): ${field} "${strValue}" → "${normalized}"`);
            updates[field] = normalized;
            gigHasIssues = true;
            fieldsFixed++;
          }
        }
      }

      // Update gig if any fields needed fixing
      if (gigHasIssues) {
        await db.update(gigs)
          .set(updates)
          .where(sql`${gigs.id} = ${gig.id}`);
        gigsFixed++;
      }
    }

    // Fetch all expenses
    const allExpenses = await db.select().from(expenses);
    console.log(`\n📊 Found ${allExpenses.length} expenses to check\n`);

    let expensesFixed = 0;

    // Process each expense
    for (const expense of allExpenses) {
      const amount = String(expense.amount);
      const normalized = sanitizeCurrency(amount);

      if (amount !== normalized) {
        console.log(`  📝 Expense #${expense.id} (${expense.merchant}): "${amount}" → "${normalized}"`);
        await db.update(expenses)
          .set({ amount: normalized })
          .where(sql`${expenses.id} = ${expense.id}`);
        expensesFixed++;
      }
    }

    console.log('\n✅ Currency data cleanup complete!');
    console.log(`   Gigs fixed: ${gigsFixed} (${fieldsFixed} fields)`);
    console.log(`   Expenses fixed: ${expensesFixed}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the script
fixCurrencyData()
  .then(() => {
    console.log('\n🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
