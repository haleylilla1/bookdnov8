import { storage } from './storage';

// Helper function to convert Supabase URLs to proxy URLs to bypass SSL issues
function convertToProxyUrl(originalUrl: string): string {
  if (!originalUrl || !originalUrl.includes('supabase.co')) {
    return originalUrl;
  }
  
  // Extract the path after 'receipts/' in the Supabase URL
  const match = originalUrl.match(/\/storage\/v1\/object\/public\/receipts\/(.+)$/);
  if (match) {
    const receiptPath = match[1];
    return `/api/receipt-proxy/${receiptPath}`;
  }
  
  return originalUrl;
}
import type { User, Gig, Expense } from '@shared/schema';

interface ReportOptions {
  userId: number;
  period: 'monthly' | 'quarterly' | 'annual';
  year: number;
  month?: number;
  quarter?: number;
}

interface ReportData {
  user: User;
  gigs: Gig[];
  expenses: Expense[];
  period: string;
  totalIncome: number; // Taxable income (excludes reimbursements)
  totalReceived?: number; // Gross income (optional for backward compatibility)
  grossExpenses?: number; // Total expenses before reimbursements
  totalReimbursements?: number; // Total reimbursements from expense table
  businessDeductions?: number; // Unreimbursed expenses (optional for backward compatibility)
  totalExpenses: number; // Net expenses (after reimbursements)
  totalMileage: number;
  mileageValue: number;
  netIncome: number;
  taxPercentage: number;
  estimatedTaxes: number;
  afterTaxIncome: number;
  receipts: ReceiptData[];
}

interface ReceiptData {
  date: string;
  type: 'parking' | 'other';
  amount: number;
  description: string;
  gigName: string;
  clientName: string;
  reimbursed: boolean;
  receipts: string[]; // Array of receipt photo URLs/base64 strings
}

export async function generateProfessionalHTML(options: ReportOptions): Promise<string> {
  // MEMORY MANAGEMENT: Clear any large variables and force garbage collection at start
  if (global.gc) {
    global.gc();
  }
  
  // Validate input parameters with defaults (outside try block)
  const safeOptions = {
    userId: options.userId || 0,
    period: (options.period === 'monthly' || options.period === 'quarterly' || options.period === 'annual') ? options.period : 'monthly',
    year: options.year || new Date().getFullYear(),
    month: options.month || new Date().getMonth() + 1,
    quarter: options.quarter || Math.floor(new Date().getMonth() / 3) + 1
  };

  try {
    console.log('🚀 MEMORY OPTIMIZED: Starting HTML report generation for user:', options.userId);
    
    console.log('📊 Using safe options:', safeOptions);
    
    // Get user data with error handling
    const user = await storage.getUser(safeOptions.userId);
    if (!user) {
      console.error('❌ User not found for ID:', safeOptions.userId);
      throw new Error(`User not found: ${safeOptions.userId}`);
    }
    
    console.log('✅ User found:', user.email);
    
    // Prepare report data with comprehensive error handling
    const data = await prepareReportDataSafe(safeOptions);
    console.log('📈 Report data prepared, gigs:', data.gigs?.length || 0);
    
    const MILEAGE_RATE = 0.70; // 2025 IRS rate
    
    // Filter to completed gigs only with safe handling
    const allGigs = Array.isArray(data.gigs) ? data.gigs : [];
    const completedGigs = allGigs.filter(g => g && (g.status === 'completed' || g.actualPay));
    console.log('💰 Completed gigs found:', completedGigs.length);
    
    // Generate tax breakdown table with bulletproof logic
    const groupedGigs = groupMultiDayGigsSafe(completedGigs);
    const taxEstimatesRows = groupedGigs.map((gig, index) => {
      try {
        const actualPay = safeParseFloat(gig.actualPay);
        const tips = safeParseFloat(gig.tips);
        const gigIncome = actualPay + tips;
        
        const gigTaxRate = (gig.taxPercentage !== null && gig.taxPercentage !== undefined) 
          ? Number(gig.taxPercentage) 
          : (user.defaultTaxPercentage || 23);
        const gigTaxes = gigIncome * (gigTaxRate / 100);
        
        return `
          <tr>
              <td style="padding: 12px; border-bottom: 1px solid #000;">${escapeHtml(gig.eventName || 'Unnamed Event')}</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #000;">$${gigIncome.toFixed(2)}</td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #000;">${gigTaxRate}%</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #000; font-weight: bold;">$${gigTaxes.toFixed(2)}</td>
          </tr>
        `;
      } catch (error) {
        console.warn('⚠️ Error processing gig for tax table:', error);
        return `
          <tr>
              <td style="padding: 12px; border-bottom: 1px solid #000;">Processing Error</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #000;">$0.00</td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #000;">0%</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #000; font-weight: bold;">$0.00</td>
          </tr>
        `;
      }
    }).join('');
    
    // Ultra-safe calculation with comprehensive error handling
    const parkingTotal = allGigs.reduce((sum, g) => {
      try {
        const expense = safeParseFloat(g.parkingExpense);
        return sum + expense;
      } catch {
        return sum;
      }
    }, 0);
    
    const otherTotal = allGigs.reduce((sum, g) => {
      try {
        const expense = safeParseFloat(g.otherExpenses);
        return sum + expense;
      } catch {
        return sum;
      }
    }, 0);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Freelancer Report - ${data.period}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; background: white; }
        table { font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .page { background: white; margin: 20px 0; padding: 30px; }
        
        /* Header Styles */
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 28px; color: #000; margin-bottom: 10px; }
        .header h2 { font-size: 18px; color: #000; margin-bottom: 5px; }
        
        /* Tables */
        .table-container { overflow-x: auto; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; background: white; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #000; }
        th { background: white; font-weight: bold; color: #000; border-bottom: 2px solid #000; }
        .total-row { font-weight: bold; border-top: 2px solid #000; }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .page { padding: 20px; margin: 10px 0; }
            .header h1 { font-size: 24px; }
            .header h2 { font-size: 16px; }
            table { font-size: 11px; }
            th, td { padding: 6px 4px; }
            th { font-size: 10px; line-height: 1.2; }
        }
        
        /* Print Styles */
        @media print {
            body { background: white; }
            .page { margin: 0; page-break-after: always; }
            .page:last-child { page-break-after: auto; }
        }
        
        .section-title { color: #000; font-size: 20px; margin: 30px 0 15px 0; border-bottom: 1px solid #000; padding-bottom: 5px; }
        .highlight { font-weight: bold; }
        .tax-highlight { font-weight: bold; }
        .note { font-style: italic; color: #000; font-size: 14px; margin-top: 15px; }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <!-- Cover Page - Matching Exact Format -->
        <div class="page">
            <div style="text-align: center; margin-bottom: 50px;">
                <h1 style="font-size: 32px; margin-bottom: 30px;">FREELANCER INCOME REPORT</h1>
                
                <div style="margin: 40px 0;">
                    <h2 style="font-size: 24px; margin: 20px 0;">${(data.user.firstName || '') + ' ' + (data.user.lastName || '') || 'Freelancer'}</h2>
                </div>
                
                <div style="margin: 40px 0;">
                    <h2 style="font-size: 20px; margin: 20px 0;">${data.period}</h2>
                </div>
                
                <div style="margin: 40px 0;">
                    <p style="font-size: 16px; margin: 20px 0;">Generated: ${new Date().toLocaleDateString()}</p>
                </div>
                
                ${data.user.email ? `
                <div style="margin: 40px 0;">
                    <p style="font-size: 16px; margin: 20px 0;">Contact: ${data.user.email}</p>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Income Summary Page - Matching Exact Format -->
        <div class="page">
            <h2 style="font-size: 24px; margin-bottom: 30px; text-align: center;">INCOME SUMMARY</h2>
            
            <div style="margin: 40px 0;">
                <table style="width: 100%; border-collapse: collapse; ">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #000;">Date</th>
                            <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #000;">Source</th>
                            <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #000;">Type</th>
                            <th style="text-align: right; padding: 10px 0; border-bottom: 2px solid #000;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.gigs.map(gig => {
                          const actualPay = parseFloat(gig.actualPay || '0');
                          const tips = parseFloat(gig.tips || '0');
                          const total = actualPay + tips;
                          const dateStr = gig.date.includes(' - ') ? gig.date : new Date(gig.date).toLocaleDateString();
                          const source = gig.clientName || 'Direct Client';
                          const type = gig.gigType || 'Service';
                          
                          return `
                            <tr>
                                <td style="padding: 8px 0;">${dateStr}</td>
                                <td style="padding: 8px 0;">${source}</td>
                                <td style="padding: 8px 0;">${type}</td>
                                <td style="padding: 8px 0; text-align: right;">$${total.toFixed(2)}</td>
                            </tr>
                          `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 40px; padding: 20px; border: 1px solid #000;">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #000;">
                            <div>
                                <p style="font-size: 14px; margin-bottom: 3px;"><strong>GROSS INCOME</strong> (Total Received)</p>
                                <p style="font-size: 11px; font-style: italic;">Includes all payments + reimbursements</p>
                            </div>
                            <p style="font-size: 20px; font-weight: bold;">$${(data.totalReceived || data.totalIncome).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <div>
                                <p style="font-size: 14px; margin-bottom: 3px;"><strong>TAXABLE INCOME</strong></p>
                                <p style="font-size: 11px; font-style: italic;">Excludes reimbursements (use for tax filing)</p>
                            </div>
                            <p style="font-size: 20px; font-weight: bold;">$${data.totalIncome.toFixed(2)}</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>

        <!-- Mileage Summary Page - Matching Exact Format -->
        <div class="page">
            <h2 style="font-size: 24px; margin-bottom: 30px; text-align: center;">MILEAGE SUMMARY</h2>
            
            ${data.gigs.some(g => parseFloat(String(g.mileage || 0)) > 0) ? `
            <div style="margin: 40px 0;">
                <table style="width: 100%; border-collapse: collapse; ">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #000;">Date</th>
                            <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #000;">Purpose</th>
                            <th style="text-align: right; padding: 10px 0; border-bottom: 2px solid #000;">Miles</th>
                            <th style="text-align: right; padding: 10px 0; border-bottom: 2px solid #000;">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.gigs.filter(g => (parseInt(String(g.mileage || 0)) || 0) > 0).map(gig => {
                          const miles = parseInt(String(gig.mileage || 0)) || 0;
                          const dateStr = gig.date.includes(' - ') ? gig.date : new Date(gig.date).toLocaleDateString();
                          const purpose = `${gig.eventName || 'Event'} (${gig.clientName || 'Client'})`;
                          const value = (miles * MILEAGE_RATE);
                          
                          return `
                            <tr>
                                <td style="padding: 8px 0;">${dateStr}</td>
                                <td style="padding: 8px 0;">${purpose}</td>
                                <td style="padding: 8px 0; text-align: right;">${Math.round(miles)}</td>
                                <td style="padding: 8px 0; text-align: right;">$${value.toFixed(2)}</td>
                            </tr>
                          `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 40px;">
                    <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">TOTAL MILEAGE: ${Math.round(data.totalMileage)} miles</p>
                    <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">TOTAL MILEAGE VALUE: $${data.mileageValue.toFixed(2)}</p>
                </div>
            </div>
            ` : `
            <div style="text-align: center; margin: 40px 0;">
                <p style="font-size: 16px;">No mileage recorded for this period.</p>
            </div>
            `}
        </div>



        <!-- Detailed Tax Estimates Page -->
        <div class="page">
            <h2 style="font-size: 24px; margin-bottom: 30px; text-align: center;">DETAILED TAX ESTIMATES BY GIG</h2>
            
            <div style="margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #000; font-weight: bold;">Gig</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #000; font-weight: bold;">Income</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #000; font-weight: bold;">Tax Rate</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #000; font-weight: bold;">Tax Estimate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${taxEstimatesRows}
                        
                        <!-- Total Row -->
                        <tr style="font-weight: bold; border-top: 2px solid #000;">
                            <td style="padding: 15px; border-bottom: 2px solid #000;">TOTAL</td>
                            <td style="padding: 15px; text-align: right; border-bottom: 2px solid #000;">$${data.totalIncome.toFixed(2)}</td>
                            <td style="padding: 15px; text-align: center; border-bottom: 2px solid #000;">-</td>
                            <td style="padding: 15px; text-align: right; border-bottom: 2px solid #000; font-weight: bold;">$${data.estimatedTaxes.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="margin: 30px 0; padding: 15px; border: 1px solid #000;">
                <p style="font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>Calculation Method:</strong> For each gig, taxes are calculated using the gig's individual tax rate applied to gross income. 
                    Income includes actual pay and tips. Each gig uses its individual tax rate setting. These are taxes on gross income before business expense deductions.
                </p>
            </div>
        </div>

        <!-- Expense Receipts Page -->
        <div class="page">
            <h2 style="font-size: 24px; margin-bottom: 30px; text-align: center;">BUSINESS EXPENSES</h2>
            
            <!-- Standalone Business Expenses by Category -->
            ${data.expenses.length > 0 ? `
                <div style="margin: 30px 0;">
                    ${(() => {
                        // Group expenses by category
                        const expensesByCategory: Record<string, any[]> = data.expenses.reduce((acc, expense) => {
                            const category = expense.category;
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(expense);
                            return acc;
                        }, {} as Record<string, any[]>);
                        
                        // Sort categories alphabetically
                        const sortedCategories = Object.keys(expensesByCategory).sort();
                        
                        return sortedCategories.map(category => {
                            const categoryExpenses = expensesByCategory[category];
                            let categoryTotal = 0;
                            let categoryReimbursed = 0;
                            let categoryNet = 0;
                            
                            return `
                            <div style="margin-bottom: 30px;">
                                <h3 style="font-size: 14px; margin-bottom: 10px; padding: 8px; border-bottom: 1px solid #000; font-weight: bold;">${category}</h3>
                                <div style="overflow-x: auto;">
                                    <table style="width: 100%; border-collapse: collapse;  font-size: 10px;">
                                        <thead>
                                            <tr>
                                                <th style="text-align: left; padding: 6px 4px; border-bottom: 2px solid #000; font-size: 10px;">Date</th>
                                                <th style="text-align: left; padding: 6px 4px; border-bottom: 2px solid #000; font-size: 10px;">Merchant</th>
                                                <th style="text-align: left; padding: 6px 4px; border-bottom: 2px solid #000; font-size: 10px;">Purpose</th>
                                                <th style="text-align: right; padding: 6px 4px; border-bottom: 2px solid #000; font-size: 10px;">Amount</th>
                                                <th style="text-align: right; padding: 6px 4px; border-bottom: 2px solid #000; font-size: 10px;">Reimbursed</th>
                                                <th style="text-align: right; padding: 6px 4px; border-bottom: 2px solid #000; font-size: 10px; font-weight: bold;">Out of Pocket</th>
                                            </tr>
                                        </thead>
                                    <tbody>
                                        ${categoryExpenses.map(expense => {
                                            const expenseAmount = parseFloat(expense.amount || '0');
                                            const reimbursedAmount = parseFloat(expense.reimbursedAmount || '0');
                                            const outOfPocket = expenseAmount - reimbursedAmount;
                                            categoryTotal += expenseAmount;
                                            categoryReimbursed += reimbursedAmount;
                                            categoryNet += outOfPocket;
                                            
                                            return `
                                                <tr>
                                                    <td style="padding: 6px 4px; font-size: 10px; border-bottom: 1px solid #000;">${new Date(expense.date).toLocaleDateString()}</td>
                                                    <td style="padding: 6px 4px; font-size: 10px; border-bottom: 1px solid #000;">${expense.merchant}</td>
                                                    <td style="padding: 6px 4px; font-size: 10px; border-bottom: 1px solid #000;">${expense.businessPurpose}</td>
                                                    <td style="padding: 6px 4px; text-align: right; font-size: 10px; border-bottom: 1px solid #000;">$${expenseAmount.toFixed(2)}</td>
                                                    <td style="padding: 6px 4px; text-align: right; font-size: 10px; border-bottom: 1px solid #000;">${reimbursedAmount > 0 ? '$' + reimbursedAmount.toFixed(2) : '-'}</td>
                                                    <td style="padding: 6px 4px; text-align: right; font-size: 10px; border-bottom: 1px solid #000; font-weight: bold;">$${outOfPocket.toFixed(2)}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                        <tr style="font-weight: bold; border-top: 2px solid #000;">
                                            <td style="padding: 8px 4px; font-size: 10px;" colspan="3">Category Total</td>
                                            <td style="padding: 8px 4px; text-align: right; font-size: 10px;">$${categoryTotal.toFixed(2)}</td>
                                            <td style="padding: 8px 4px; text-align: right; font-size: 10px;">${categoryReimbursed > 0 ? '$' + categoryReimbursed.toFixed(2) : '-'}</td>
                                            <td style="padding: 8px 4px; text-align: right; font-size: 10px; font-weight: bold;">$${categoryNet.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        `}).join('');
                    })()}
                    
                    <!-- Category Summary -->
                    ${(() => {
                        const categoryTotals: Record<string, { gross: number, reimbursed: number, net: number }> = data.expenses.reduce((acc, expense) => {
                            const category = expense.category;
                            const expenseAmount = parseFloat(expense.amount || '0');
                            const reimbursedAmount = parseFloat(expense.reimbursedAmount || '0');
                            
                            if (!acc[category]) {
                                acc[category] = { gross: 0, reimbursed: 0, net: 0 };
                            }
                            
                            acc[category].gross += expenseAmount;
                            acc[category].reimbursed += reimbursedAmount;
                            acc[category].net += (expenseAmount - reimbursedAmount);
                            
                            return acc;
                        }, {} as Record<string, { gross: number, reimbursed: number, net: number }>);
                        
                        const sortedCategories = Object.entries(categoryTotals).sort(([,a], [,b]) => b.net - a.net);
                        
                        return sortedCategories.length > 0 ? `
                            <div style="margin-top: 40px; border-top: 2px solid #000; padding-top: 20px;">
                                <h3 style="font-size: 18px; margin-bottom: 20px; font-weight: bold;">SUMMARY BY CATEGORY</h3>
                                <table style="width: 100%; border-collapse: collapse; ">
                                    <thead>
                                        <tr>
                                            <th style="text-align: left; padding: 8px 4px; border-bottom: 2px solid #000; font-size: 12px; line-height: 1.3;">Category</th>
                                            <th style="text-align: right; padding: 8px 4px; border-bottom: 2px solid #000; font-size: 12px; line-height: 1.3;">Gross Expenses</th>
                                            <th style="text-align: right; padding: 8px 4px; border-bottom: 2px solid #000; font-size: 12px; line-height: 1.3;">Reimbursements</th>
                                            <th style="text-align: right; padding: 8px 4px; border-bottom: 2px solid #000; font-size: 12px; line-height: 1.3;">Net Out-of-Pocket</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${sortedCategories.map(([category, totals]) => `
                                            <tr>
                                                <td style="padding: 6px 4px; font-size: 11px; line-height: 1.3; border-bottom: 1px solid #000;">${category}</td>
                                                <td style="padding: 6px 4px; text-align: right; font-size: 11px; border-bottom: 1px solid #000;">$${totals.gross.toFixed(2)}</td>
                                                <td style="padding: 6px 4px; text-align: right; font-size: 11px; border-bottom: 1px solid #000;">${totals.reimbursed > 0 ? '-$' + totals.reimbursed.toFixed(2) : '$0.00'}</td>
                                                <td style="padding: 6px 4px; text-align: right; font-size: 11px; font-weight: bold; border-bottom: 1px solid #000;">$${totals.net.toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                        <tr style="border-top: 2px solid #000; font-weight: bold;">
                                            <td style="padding: 8px 4px; font-size: 12px;">TOTALS</td>
                                            <td style="padding: 8px 4px; text-align: right; font-size: 12px;">$${Object.values(categoryTotals).reduce((sum, val) => sum + val.gross, 0).toFixed(2)}</td>
                                            <td style="padding: 8px 4px; text-align: right; font-size: 12px;">-$${Object.values(categoryTotals).reduce((sum, val) => sum + val.reimbursed, 0).toFixed(2)}</td>
                                            <td style="padding: 8px 4px; text-align: right; font-size: 12px;">$${Object.values(categoryTotals).reduce((sum, val) => sum + val.net, 0).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div style="margin-top: 20px; padding: 15px; border: 1px solid #000; font-size: 14px;">
                                    <strong>Note:</strong> Gross expenses are your total business costs. Reimbursements reduce your taxable income. 
                                    Net out-of-pocket represents your actual business expense for tax deduction purposes.
                                </div>
                            </div>
                        ` : '';
                    })()}
                </div>
            ` : ''}
        </div>

        <!-- Summary Totals Page -->
        <div class="page">
            <h2 style="font-size: 24px; margin-bottom: 30px; text-align: center;">SUMMARY TOTALS</h2>
            
            <!-- Income Section -->
            <div style="margin: 30px 0; padding: 20px; border: 1px solid #000;">
                <h3 style="font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 8px; font-weight: bold;">INCOME</h3>
                <div style="margin-left: 15px; font-size: 16px; line-height: 1.8;">
                    <p style="margin: 8px 0;"><strong>Total Income Received:</strong> $${(data.totalReceived || data.totalIncome).toFixed(2)}</p>
                    <p style="margin: 8px 0; font-size: 14px; margin-left: 20px;">↳ All payments received from gigs</p>
                </div>
            </div>
            
            <!-- Business Expenses Section -->
            <div style="margin: 30px 0; padding: 20px; border: 1px solid #000;">
                <h3 style="font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 8px; font-weight: bold;">BUSINESS EXPENSES</h3>
                <div style="margin-left: 15px; font-size: 16px; line-height: 1.8;">
                    <p style="margin: 8px 0;"><strong>Total Expenses:</strong> $${(data.grossExpenses || 0).toFixed(2)}</p>
                    <p style="margin: 8px 0;"><strong>Reimbursements Received:</strong> -$${(data.totalReimbursements || 0).toFixed(2)}</p>
                    <p style="margin: 8px 0; border-top: 1px solid #000; padding-top: 8px;"><strong>Net Out of Pocket:</strong> $${data.totalExpenses.toFixed(2)}</p>
                </div>
            </div>
            
            <!-- Mileage Section -->
            <div style="margin: 30px 0; padding: 20px; border: 1px solid #000;">
                <h3 style="font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 8px; font-weight: bold;">MILEAGE DEDUCTION</h3>
                <div style="margin-left: 15px; font-size: 16px; line-height: 1.8;">
                    <p style="margin: 8px 0;"><strong>Total Miles:</strong> ${Math.round(data.totalMileage)} miles</p>
                    <p style="margin: 8px 0;"><strong>IRS Rate:</strong> $0.70/mile</p>
                    <p style="margin: 8px 0; border-top: 1px solid #000; padding-top: 8px;"><strong>Mileage Deduction Value:</strong> $${data.mileageValue.toFixed(2)}</p>
                </div>
            </div>
            
            <!-- Tax Estimate Section -->
            <div style="margin: 30px 0; padding: 20px; border: 2px solid #000;">
                <h3 style="font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 8px; font-weight: bold;">TAX ESTIMATE</h3>
                <div style="margin-left: 15px; font-size: 16px; line-height: 1.8;">
                    <p style="margin: 8px 0;"><strong>Estimated Taxes (on taxable income):</strong> <span style="font-size: 20px; font-weight: bold;">$${data.estimatedTaxes.toFixed(2)}</span></p>
                    <p style="margin: 8px 0; font-size: 14px; margin-left: 20px;">↳ Calculated on gross taxable income before deductions</p>
                    <p style="margin: 8px 0; font-size: 14px; margin-left: 20px;">↳ Business deductions reduce taxable income when filing</p>
                </div>
            </div>
        </div>

        <!-- Tax Due Dates Page -->
        <div class="page">
            <h2 style="font-size: 24px; margin-bottom: 30px; text-align: center;">2025 ESTIMATED TAX PAYMENT DUE DATES</h2>
            
            <div style="margin: 40px 0; font-size: 16px; line-height: 2;">
                <p><strong>1st Quarter (Jan 1 - Mar 31): April 15, 2025</strong></p>
                <p><strong>2nd Quarter (Apr 1 - May 31): June 16, 2025</strong></p>
                <p><strong>3rd Quarter (June 1 - Aug 31): September 15, 2025</strong></p>
                <p><strong>4th Quarter (Sept 1 - Dec 31): January 15, 2026</strong></p>
            </div>
            
            <div style="margin: 40px 0; padding: 20px; border: 2px solid #000;">
                <h3 style="font-size: 16px; margin-bottom: 12px; font-weight: bold;">IMPORTANT TAX DISCLAIMER</h3>
                <p style="font-size: 13px; line-height: 1.6; margin: 8px 0;">
                    <strong>User-Entered Tax Estimates:</strong> All tax calculations in this report are based on the tax percentage(s) 
                    YOU entered in Bookd. These are your personal estimates, not professional tax advice.
                </p>
                <p style="font-size: 13px; line-height: 1.6; margin: 8px 0;">
                    <strong>Not Tax Advice:</strong> Bookd is a tracking tool, not a tax advisor. This report is for informational 
                    and record-keeping purposes only. We do not provide tax, legal, or accounting advice.
                </p>
                <p style="font-size: 13px; line-height: 1.6; margin: 8px 0;">
                    <strong>Consult a Professional:</strong> Please consult with a qualified CPA, tax professional, or enrolled agent 
                    to determine your actual tax obligations, deductions, estimated tax payments, and filing requirements based on 
                    your complete financial situation.
                </p>
                <p style="font-size: 13px; line-height: 1.6; margin: 8px 0;">
                    <strong>No Liability:</strong> Bookd and its creators assume no responsibility for the accuracy of tax estimates, 
                    calculations, or any tax-related decisions you make based on this report.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
  } catch (error) {
    console.error('❌ Critical error in HTML generation:', error);
    
    // Return bulletproof fallback HTML report
    return generateFallbackReport(safeOptions || options, error);
  }
}

// Helper functions for bulletproof HTML generation
function safeParseFloat(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function groupMultiDayGigsSafe(gigs: any[]): any[] {
  try {
    return groupMultiDayGigs(gigs);
  } catch (error) {
    console.warn('⚠️ Error grouping multi-day gigs, using individual gigs:', error);
    return Array.isArray(gigs) ? gigs : [];
  }
}

async function prepareReportDataSafe(options: ReportOptions): Promise<ReportData> {
  try {
    return await prepareReportData(options);
  } catch (error) {
    console.error('❌ Error preparing report data:', error);
    // Return fallback data
    const user = await storage.getUser(options.userId);
    return {
      user: user || { email: 'Unknown User', defaultTaxPercentage: 23 } as any,
      gigs: [],
      expenses: [],
      period: 'Report Period',
      totalIncome: 0,
      totalExpenses: 0,
      totalMileage: 0,
      mileageValue: 0,
      netIncome: 0,
      taxPercentage: 23,
      estimatedTaxes: 0,
      afterTaxIncome: 0,
      receipts: []
    };
  }
}

function generateFallbackReport(options: ReportOptions, error: any): string {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Generation Issue</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: #f8f9fa; }
            table { font-family: Arial, sans-serif; }
            .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .error { color: #dc3545; margin: 20px 0; }
            .info { background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Report Generation Notice</h1>
                <p>We encountered an issue generating your professional report.</p>
            </div>
            
            <div class="info">
                <h3>What happened?</h3>
                <p>The report generation system experienced a temporary issue. This is typically due to:</p>
                <ul>
                    <li>Database connectivity issues</li>
                    <li>Data processing errors</li>
                    <li>System maintenance</li>
                </ul>
            </div>
            
            <div class="info">
                <h3>What can you do?</h3>
                <ol>
                    <li>Wait a few minutes and try again</li>
                    <li>Refresh the dashboard and generate the report again</li>
                    <li>Check that you have completed gigs for the selected period</li>
                    <li>Contact support if the issue persists</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <a href="javascript:window.close()" class="button">Close Window</a>
                <a href="/" class="button" style="margin-left: 10px;">Return to Dashboard</a>
            </div>
            
            ${process.env.NODE_ENV === 'development' ? `
              <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px; font-size: 12px;">
                <strong>Debug Info:</strong><br>
                User ID: ${options.userId}<br>
                Period: ${options.period}<br>
                Year: ${options.year}<br>
                Month: ${options.month || 'N/A'}<br>
                Error: ${errorMessage}<br>
                Timestamp: ${new Date().toISOString()}
              </div>
            ` : ''}
        </div>
    </body>
    </html>
  `;
}

async function prepareReportData(options: ReportOptions): Promise<ReportData> {
  const user = await storage.getUser(options.userId);
  if (!user) throw new Error('User not found');

  // Calculate date range
  let startDate: string, endDate: string;
  if (options.period === 'monthly' && options.month) {
    startDate = `${options.year}-${options.month.toString().padStart(2, '0')}-01`;
    const nextMonth = options.month === 12 ? 1 : options.month + 1;
    const nextYear = options.month === 12 ? options.year + 1 : options.year;
    endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
  } else if (options.period === 'quarterly' && options.quarter) {
    // IRS Quarterly Tax Periods (Income Earned Periods)
    if (options.quarter === 1) {
      startDate = `${options.year}-01-01`; // Jan 1
      endDate = `${options.year}-04-01`;   // Mar 31 (end date is exclusive)
    } else if (options.quarter === 2) {
      startDate = `${options.year}-04-01`; // Apr 1
      endDate = `${options.year}-06-01`;   // May 31 (end date is exclusive)
    } else if (options.quarter === 3) {
      startDate = `${options.year}-06-01`; // Jun 1
      endDate = `${options.year}-09-01`;   // Aug 31 (end date is exclusive)
    } else { // quarter 4 or fallback
      startDate = `${options.year}-09-01`; // Sep 1
      endDate = `${options.year + 1}-01-01`; // Dec 31 (end date is exclusive)
    }
  } else {
    startDate = `${options.year}-01-01`;
    endDate = `${options.year + 1}-01-01`;
  }

  // Get data
  const gigs = await storage.getGigsByDateRange(options.userId, startDate, endDate);
  const expenses = await storage.getExpensesByDateRange(options.userId, startDate, endDate);
  
  // Group multi-day gigs to prevent double counting
  const groupedGigs = groupMultiDayGigs(gigs);
  
  // Filter completed gigs FIRST so expenses match income calculations
  const completedGigs = groupedGigs.filter(g => g.status === 'completed');
  
  // Add parking expenses from COMPLETED gigs to expenses array as "Work Travel" category
  // Use reimbursedParking (actual dollar amount from Got Paid workflow) for consistency
  const parkingExpenses = completedGigs
    .filter(gig => parseFloat(gig.parkingExpense || '0') > 0)
    .map((gig, index) => {
      const parkingAmount = parseFloat(gig.parkingExpense || '0');
      // Use the actual reimbursed amount from Got Paid workflow, or check old boolean field
      const reimbursedAmount = parseFloat((gig as any).reimbursedParking || '0') || 
                               ((gig as any).parkingReimbursed ? parkingAmount : 0);
      return {
        id: parseInt(`${gig.id}${index}000`),
        userId: gig.userId,
        date: gig.date,
        amount: parkingAmount.toString(),
        merchant: `Parking - ${gig.eventName || 'Gig'}`,
        businessPurpose: `Parking for ${gig.eventName || 'gig'}`,
        category: 'Work Travel',
        gigId: gig.id,
        reimbursedAmount: reimbursedAmount.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  
  // Add "other expenses" from COMPLETED gigs as "Gig Supplies" category
  // Use reimbursedOther (actual dollar amount from Got Paid workflow) for consistency
  const otherGigExpenses = completedGigs
    .filter(gig => parseFloat(gig.otherExpenses || '0') > 0)
    .map((gig, index) => {
      const otherAmount = parseFloat(gig.otherExpenses || '0');
      // Use the actual reimbursed amount from Got Paid workflow, or check old boolean field
      const reimbursedAmount = parseFloat((gig as any).reimbursedOther || '0') || 
                               ((gig as any).otherExpensesReimbursed ? otherAmount : 0);
      return {
        id: parseInt(`${gig.id}${index}999`),
        userId: gig.userId,
        date: gig.date,
        amount: otherAmount.toString(),
        merchant: `${gig.eventName || 'Gig'} - Other`,
        businessPurpose: `Other expenses for ${gig.eventName || 'gig'}`,
        category: 'Gig Supplies',
        gigId: gig.id,
        reimbursedAmount: reimbursedAmount.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  
  // Combine standalone expenses with gig expenses (parking + other)
  const allExpenses = [...expenses, ...parkingExpenses, ...otherGigExpenses];
  
  // Calculate totals using tax-smart logic (same as dashboard)
  // Note: completedGigs already defined above for expense filtering
  let totalIncome = 0; // Taxable income
  let totalReceived = 0; // Gross income
  let businessDeductions = 0; // Unreimbursed expenses
  
  completedGigs.forEach(gig => {
    const tips = parseFloat(gig.tips || '0');
    
    if (gig.totalReceived && parseFloat(gig.totalReceived) > 0) {
      // New "Got Paid" workflow - use tax-smart calculation
      const received = parseFloat(gig.totalReceived || '0');
      const reimbursedParking = parseFloat(gig.reimbursedParking || '0');
      const reimbursedOther = parseFloat(gig.reimbursedOther || '0');
      const unreimbursedParking = parseFloat(gig.unreimbursedParking || '0');
      const unreimbursedOther = parseFloat(gig.unreimbursedOther || '0');
      
      totalReceived += received + tips;
      businessDeductions += unreimbursedParking + unreimbursedOther;
      totalIncome += (received - reimbursedParking - reimbursedOther) + tips; // Taxable income
    } else {
      // Legacy calculation
      const payAmount = parseFloat(gig.actualPay || '0');
      totalReceived += payAmount + tips;
      totalIncome += payAmount + tips;
    }
  });

  // Calculate expense totals from allExpenses (unified source for all expense tracking)
  const grossExpenses = allExpenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount || '0');
  }, 0);
  
  const totalReimbursements = allExpenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.reimbursedAmount || '0');
  }, 0);
  
  // Net expenses = gross - reimbursements (what you actually paid out of pocket)
  const totalExpenses = grossExpenses - totalReimbursements;

  const totalMileage = completedGigs.reduce((sum, gig) => {
    return sum + (parseInt(String(gig.mileage || 0)) || 0);
  }, 0);

  const MILEAGE_RATE = 0.70; // 2025 IRS standard mileage rate
  const mileageValue = totalMileage * MILEAGE_RATE;
  const netIncome = totalIncome - totalExpenses - mileageValue;
  
  // Calculate tax estimates using tax-smart logic (same as dashboard)
  const estimatedTaxes = completedGigs.reduce((sum, gig) => {
    const tips = parseFloat(gig.tips || '0');
    let taxableIncome = 0;
    
    if (gig.totalReceived && parseFloat(gig.totalReceived) > 0) {
      // New calculation: total received minus reimbursements
      const received = parseFloat(gig.totalReceived || '0');
      const reimbursedParking = parseFloat(gig.reimbursedParking || '0');
      const reimbursedOther = parseFloat(gig.reimbursedOther || '0');
      taxableIncome = received - reimbursedParking - reimbursedOther;
    } else {
      // Legacy calculation
      taxableIncome = parseFloat(gig.actualPay || '0');
    }
    
    // Add tips (always taxable)
    taxableIncome += tips;
    
    const gigTaxRate = (gig.taxPercentage !== null && gig.taxPercentage !== undefined) 
      ? gig.taxPercentage 
      : (user.defaultTaxPercentage || 23);
    return sum + (taxableIncome * gigTaxRate / 100);
  }, 0);
  
  // Use user's default tax percentage for display (individual rates used in calculation)
  const taxPercentage = user.defaultTaxPercentage || 23;
  const afterTaxIncome = netIncome - estimatedTaxes;

  // Prepare receipts data with photos and reimbursement status
  const receipts: ReceiptData[] = [];
  
  completedGigs.forEach(gig => {
    if (parseFloat(gig.parkingExpense || '0') > 0) {
      const parkingReceipts = Array.isArray((gig as any).parkingReceipts) ? (gig as any).parkingReceipts : [];
      
      receipts.push({
        date: gig.date,
        type: 'parking' as const,
        amount: parseFloat(gig.parkingExpense || '0'),
        description: 'Parking expenses',
        gigName: gig.eventName || 'Unnamed Event',
        clientName: gig.clientName || 'Direct Client',
        reimbursed: Boolean((gig as any).parkingReimbursed),
        receipts: parkingReceipts
      });
    }
    if (parseFloat(gig.otherExpenses || '0') > 0) {
      const otherReceipts = Array.isArray((gig as any).otherExpenseReceipts) ? (gig as any).otherExpenseReceipts : [];
      
      receipts.push({
        date: gig.date,
        type: 'other' as const,
        amount: parseFloat(gig.otherExpenses || '0'),
        description: 'Other business expenses',
        gigName: gig.eventName || 'Unnamed Event',
        clientName: gig.clientName || 'Direct Client',
        reimbursed: Boolean((gig as any).otherExpensesReimbursed),
        receipts: otherReceipts
      });
    }
  });

  const periodStr = options.period === 'monthly' && options.month 
    ? `${new Date(options.year, options.month - 1).toLocaleString('default', { month: 'long' })} ${options.year}`
    : options.period === 'quarterly' && options.quarter
    ? `Q${options.quarter} ${options.year}`
    : `${options.year}`;

  return {
    user,
    gigs: completedGigs,
    expenses: allExpenses,
    period: periodStr,
    totalIncome, // Now represents taxable income
    totalReceived, // Gross income (new field)
    grossExpenses, // Total expenses before reimbursements
    totalReimbursements, // Total reimbursements from expense table
    businessDeductions, // Unreimbursed expenses (new field)
    totalExpenses, // Net expenses (after reimbursements)
    totalMileage,
    mileageValue,
    netIncome,
    taxPercentage,
    estimatedTaxes,
    afterTaxIncome,
    receipts: receipts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };
}

function groupMultiDayGigs(gigs: Gig[]): Gig[] {
  const parseGigDate = (dateStr: string) => new Date(dateStr + 'T00:00:00.000Z');
  const sortedGigs = [...gigs].sort((a, b) => parseGigDate(a.date).getTime() - parseGigDate(b.date).getTime());
  const grouped: Gig[] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < sortedGigs.length; i++) {
    if (processed.has(sortedGigs[i].id)) continue;
    
    const currentGig = sortedGigs[i];
    const similarGigs = [currentGig];
    processed.add(currentGig.id);
    
    for (let j = i + 1; j < sortedGigs.length; j++) {
      const nextGig = sortedGigs[j];
      if (processed.has(nextGig.id)) continue;
      
      const lastGigDate = parseGigDate(similarGigs[similarGigs.length - 1].date);
      const nextDate = parseGigDate(nextGig.date);
      const dayDiff = (nextDate.getTime() - lastGigDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (nextGig.eventName === currentGig.eventName &&
          nextGig.clientName === currentGig.clientName &&
          nextGig.gigType === currentGig.gigType &&
          dayDiff > 0 && dayDiff <= 7) {
        similarGigs.push(nextGig);
        processed.add(nextGig.id);
      }
    }
    
    if (similarGigs.length > 1) {
      // Multi-day gig - Use only first entry (total amount already entered once)
      grouped.push({
        ...similarGigs[0], // Use first entry data completely
        date: `${similarGigs[0].date} - ${similarGigs[similarGigs.length - 1].date}`
      });
    } else {
      grouped.push(currentGig);
    }
  }
  
  return grouped;
}