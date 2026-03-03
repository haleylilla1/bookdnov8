import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { editExpenseSchema, type ExpenseFormData } from "@/lib/form-schemas";
import { useFormErrorHandler } from "@/hooks/use-form-error-handler";
import { ChevronLeft, ChevronRight, Edit2, Pencil, Save, X, DollarSign, Calendar, Users, TrendingUp, Receipt, Calculator, PiggyBank, FileText, Download, Trash2, Car } from "lucide-react";
import { AmountField, MerchantField, BusinessPurposeField, CategoryField, DateField } from "@/components/ui/form-field-wrapper";
import { useToast } from "@/hooks/use-toast";
import type { Gig, User, Expense } from "@shared/schema";
import { BUSINESS_EXPENSE_CATEGORIES } from "@shared/schema";
import { Capacitor } from "@capacitor/core";

type TimePeriod = "monthly" | "quarterly" | "annual";

type ExpenseEditFormData = ExpenseFormData;

// Utility function to parse dates consistently across timezones
const parseGigDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

// IRS 2025 Quarterly Tax Dates (Income Earned Periods)
const getQuarterDateRange = (year: number, quarter: number) => {
  const quarterRanges = {
    1: { start: new Date(year, 0, 1), end: new Date(year, 2, 31) }, // Jan 1 - Mar 31
    2: { start: new Date(year, 3, 1), end: new Date(year, 4, 31) }, // Apr 1 - May 31
    3: { start: new Date(year, 5, 1), end: new Date(year, 7, 31) }, // Jun 1 - Aug 31
    4: { start: new Date(year, 8, 1), end: new Date(year, 11, 31) } // Sep 1 - Dec 31
  };
  return quarterRanges[quarter as keyof typeof quarterRanges];
};

const getCurrentQuarter = (date: Date): number => {
  const month = date.getMonth() + 1; // Convert to 1-12
  if (month >= 1 && month <= 3) return 1; // Jan-Mar
  if (month >= 4 && month <= 5) return 2; // Apr-May
  if (month >= 6 && month <= 8) return 3; // Jun-Aug
  return 4; // Sep-Dec
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function Dashboard({ onOpenAddGig, onOpenAddExpense }: { onOpenAddGig?: () => void; onOpenAddExpense?: () => void } = {}) {
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
  const [editingGoal, setEditingGoal] = useState<"monthly" | "quarterly" | "annual" | null>(null);
  const [goalAmount, setGoalAmount] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEarningsBreakdown, setShowEarningsBreakdown] = useState(false);
  const [showProjectedBreakdown, setShowProjectedBreakdown] = useState(false);

  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [showTipsBreakdown, setShowTipsBreakdown] = useState(false);
  const [showExpensesBreakdown, setShowExpensesBreakdown] = useState(false);
  const [showNewExpensesBreakdown, setShowNewExpensesBreakdown] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const hasUpdatedStatusesRef = useRef(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingGigExpense, setEditingGigExpense] = useState<any | null>(null);
  
  const { handleError, handleSuccess } = useFormErrorHandler();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: 1,
  });

  // Debug user authentication
  useEffect(() => {
  }, [user, userLoading, userError]);

  // Helper to invalidate all dashboard-related caches
  const invalidateDashboardCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
  };

  // Mutation to automatically update gig statuses
  const updateGigStatusesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/gigs/update-statuses");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.updatedCount > 0) {
        invalidateDashboardCaches();
      }
    },
    onError: (error) => {
      console.error("Failed to update gig statuses:", error);
    },
  });

  // Fetch summary from server (fast - no need to load all gigs)
  interface DashboardSummary {
    actualEarnings: number;
    projectedEarnings: number;
    totalTips: number;
    totalExpenses: number;
    estimatedTax: number;
    completedGigs: number;
    upcomingGigs: number;
    totalGigs: number;
    totalReceived: number;
    businessDeductions: number;
  }
  
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary", selectedPeriod, currentDate.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/summary?period=${selectedPeriod}&date=${currentDate.toISOString()}`, { credentials: 'include' });
      const data = await res.json();
      return data;
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fetch gigs for breakdown modals only (limited to recent 500 for performance)
  const { data: gigsResponse, isLoading: gigsLoading, error: gigsError } = useQuery<{ gigs: Gig[], total: number }>({
    queryKey: ["/api/gigs", { lightweight: true }],
    queryFn: () => fetch('/api/gigs?lightweight=true&limit=500', { credentials: 'include' }).then(res => res.json()),
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const gigs = gigsResponse?.gigs || [];

  // Fetch expenses for breakdown modals (limited for performance)
  const { data: expensesResponse, isLoading: expensesLoading } = useQuery<{ expenses: Expense[], total: number }>({
    queryKey: ["/api/expenses"],
    queryFn: () => fetch('/api/expenses?limit=500', { credentials: 'include' }).then(res => res.json()),
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const expenses = expensesResponse?.expenses || [];



  // Automatically update gig statuses when dashboard loads (once per session)
  useEffect(() => {
    if (gigs.length > 0 && !hasUpdatedStatusesRef.current) {
      hasUpdatedStatusesRef.current = true;
      updateGigStatusesMutation.mutate();
    }
  }, [gigs.length]); // Only run when gigs are initially loaded

  // Fetch period-specific goal
  const { data: currentGoal, refetch: refetchGoal } = useQuery<{ goalAmount: string; id: number } | null>({
    queryKey: ["/api/goals/period", selectedPeriod, currentDate.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/goals/period?period=${selectedPeriod}&date=${currentDate.toISOString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Backend returns an array, get the first goal if exists
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      return null;
    },
    retry: 1,
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (goalData: { amount: string }) => {
      const response = await apiRequest("POST", `/api/goals/period/${selectedPeriod}/${currentDate.toISOString()}`, goalData);
      return response;
    },
    onSuccess: () => {
      // Invalidate cache to force refetch
      queryClient.invalidateQueries({ queryKey: ["/api/goals/period", selectedPeriod, currentDate.toISOString()] });
      handleSuccess("Goal updated successfully!");
      setEditingGoal(null);
    },
    onError: (error) => {
      handleError(error, "update goal");
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async (expenseData: { id: number; data: Partial<Expense> }) => {
      const response = await apiRequest("PUT", `/api/expenses/${expenseData.id}`, expenseData.data);
      return response.json();
    },
    onSuccess: () => {
      handleSuccess("Expense updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      setEditingExpense(null);
    },
    onError: (error) => {
      handleError(error, "update expense");
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      await apiRequest("DELETE", `/api/expenses/${expenseId}`);
    },
    onSuccess: () => {
      handleSuccess("Expense deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
    },
    onError: (error) => {
      handleError(error, "delete expense");
    },
  });

  // Clear gig expenses function
  const clearGigExpenses = async (gigId: number) => {
    try {
      const response = await apiRequest("PUT", `/api/gigs/${gigId}`, {
        parkingExpense: "0.00",
        parkingDescription: null,
        parkingReimbursed: false,
        otherExpenses: "0.00",
        otherExpenseDescription: null,
        otherExpensesReimbursed: false,
        mileage: 0
      });
      
      handleSuccess("Gig expenses cleared successfully!");
      invalidateDashboardCaches();
    } catch (error) {
      handleError(error, "clear gig expenses");
    }
  };

  // Update gig expenses mutation
  const updateGigExpensesMutation = useMutation({
    mutationFn: async (gigData: { id: number; data: any }) => {
      return await apiRequest("PUT", `/api/gigs/${gigData.id}`, gigData.data);
    },
    onSuccess: () => {
      handleSuccess("Gig expenses updated successfully!");
      invalidateDashboardCaches();
      setEditingGigExpense(null);
    },
    onError: (error) => {
      handleError(error, "update gig expenses");
    },
  });

  // Safe numeric parsing function
  const safeParseFloat = (value: string | null | undefined): number => {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : Math.max(0, parsed);
  };

  // Simple period filtering - let calculations handle multi-day logic naturally
  const currentPeriodGigs = useMemo(() => {
    if (!gigs || !Array.isArray(gigs) || gigs.length === 0) return [];
    
    return gigs.filter(gig => {
      const gigDate = parseGigDate(gig.date);
      const currentUtcDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      
      if (isNaN(gigDate.getTime())) return false;
      
      if (selectedPeriod === "monthly") {
        return gigDate.getUTCMonth() === currentUtcDate.getUTCMonth() && 
               gigDate.getUTCFullYear() === currentUtcDate.getUTCFullYear();
      } else if (selectedPeriod === "quarterly") {
        const quarter = getCurrentQuarter(currentUtcDate);
        const quarterRange = getQuarterDateRange(currentUtcDate.getUTCFullYear(), quarter);
        return gigDate >= quarterRange.start && gigDate <= quarterRange.end;
      } else {
        return gigDate.getUTCFullYear() === currentUtcDate.getUTCFullYear();
      }
    });
  }, [gigs, selectedPeriod, currentDate]);

  // Filter expenses for current period
  const currentPeriodExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) return [];
    
    let startDate: Date, endDate: Date;
    
    if (selectedPeriod === "monthly") {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    } else if (selectedPeriod === "quarterly") {
      const quarter = getCurrentQuarter(currentDate);
      const quarterRange = getQuarterDateRange(currentDate.getFullYear(), quarter);
      startDate = quarterRange.start;
      endDate = quarterRange.end;
    } else {
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
    }

    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date + 'T00:00:00');
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    

    
    return filtered;
  }, [expenses, selectedPeriod, currentDate]);

  // Helper function to group multi-day gigs (prevents double-counting)
  const getGroupedGigs = (gigs: Gig[]): (Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string })[] => {
    if (!gigs || !Array.isArray(gigs) || gigs.length === 0) return [];

    const sortedGigs = [...gigs].sort((a, b) => parseGigDate(a.date).getTime() - parseGigDate(b.date).getTime());
    const grouped: (Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string })[] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < sortedGigs.length; i++) {
      if (processed.has(sortedGigs[i].id)) continue;
      
      const currentGig = sortedGigs[i];
      const similarGigs = [currentGig];
      processed.add(currentGig.id);
      
      // Look for consecutive similar gigs
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
      
      // Create consolidated gig entry
      if (similarGigs.length > 1) {
        // Multi-day gig - Use only first entry's amount (don't sum duplicates)
        grouped.push({
          ...similarGigs[0], // Use first entry data
          isMultiDay: true,
          startDate: similarGigs[0].date,
          endDate: similarGigs[similarGigs.length - 1].date
        } as Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string });
      } else {
        // Single day gig
        grouped.push({
          ...currentGig,
          isMultiDay: false,
          startDate: currentGig.date,
          endDate: currentGig.date
        } as Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string });
      }
    }
    
    return grouped;
  };

  // Use server-calculated summary for period stats (much faster than loading all gigs)
  const periodStats = useMemo(() => {
    if (summaryData) {
      return {
        actualEarnings: summaryData.actualEarnings,
        projectedEarnings: summaryData.projectedEarnings,
        totalTips: summaryData.totalTips,
        totalExpenses: summaryData.totalExpenses,
        estimatedTax: summaryData.estimatedTax,
        completedGigs: summaryData.completedGigs,
        upcomingGigs: summaryData.upcomingGigs,
        totalGigs: summaryData.totalGigs,
        totalReceived: summaryData.totalReceived,
        businessDeductions: summaryData.businessDeductions
      };
    }
    
    // Fallback to zeros while loading
    return {
      actualEarnings: 0,
      projectedEarnings: 0,
      totalTips: 0,
      totalExpenses: 0,
      estimatedTax: 0,
      completedGigs: 0,
      upcomingGigs: 0,
      totalGigs: 0,
      totalReceived: 0,
      businessDeductions: 0
    };
  }, [summaryData]);

  // Get period display text
  const getPeriodText = () => {
    switch (selectedPeriod) {
      case "monthly":
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case "quarterly":
        const quarter = getCurrentQuarter(currentDate);
        return `Q${quarter} ${currentDate.getFullYear()}`;
      case "annual":
        return currentDate.getFullYear().toString();
      default:
        return "";
    }
  };

  // Navigate periods
  const navigatePeriod = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    
    if (selectedPeriod === "monthly") {
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else if (selectedPeriod === "quarterly") {
      const currentQuarter = getCurrentQuarter(currentDate);
      let targetQuarter: number;
      
      if (direction === "prev") {
        targetQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        // When going from Q1 to Q4, go back a year
        if (currentQuarter === 1) {
          newDate.setFullYear(newDate.getFullYear() - 1);
        }
      } else {
        targetQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
        // When going from Q4 to Q1, go forward a year
        if (currentQuarter === 4) {
          newDate.setFullYear(newDate.getFullYear() + 1);
        }
      }
      
      // Set date to first month of target quarter
      if (targetQuarter === 1) {
        newDate.setMonth(0); // January
      } else if (targetQuarter === 2) {
        newDate.setMonth(3); // April
      } else if (targetQuarter === 3) {
        newDate.setMonth(5); // June
      } else { // targetQuarter === 4
        newDate.setMonth(8); // September
      }
    } else if (selectedPeriod === "annual") {
      if (direction === "prev") {
        newDate.setFullYear(newDate.getFullYear() - 1);
      } else {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
    }
    
    setCurrentDate(newDate);
  };

  // Goal management functions
  const startEditingGoal = (period: "monthly" | "quarterly" | "annual") => {
    setEditingGoal(period);
    setGoalAmount(currentGoal?.goalAmount || "");
  };

  const handleSaveGoal = () => {
    if (!goalAmount.trim()) return;
    updateGoalMutation.mutate({ amount: goalAmount.trim() });
  };



  const handleViewIncomeReport = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const reportData: any = {
        period: selectedPeriod,
        year: year.toString()
      };
      
      if (selectedPeriod === 'monthly') {
        reportData.month = month.toString();
      } else if (selectedPeriod === 'quarterly') {
        const quarter = getCurrentQuarter(currentDate);
        reportData.quarter = quarter.toString();
      }
      
      // Fetch the report HTML content from backend
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in again to access the income report.');
        }
        throw new Error('Failed to generate income report. Please try again.');
      }
      
      const data = await response.json();
      
      // Check if running on native iOS/Android using static import
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      if (isNative) {
        try {
          // Dynamically import native-only modules only on native platforms
          const { Filesystem, Directory } = await import('@capacitor/filesystem');
          const { Share } = await import('@capacitor/share');
          
          // Convert HTML to base64 for iOS file system
          const base64Data = btoa(unescape(encodeURIComponent(data.html)));
          
          // Write the HTML file to cache directory for sharing
          const writeResult = await Filesystem.writeFile({
            path: data.filename,
            data: base64Data,
            directory: Directory.Cache
          });
          
          // Open native share sheet - user can preview, save, email, or print to PDF
          await Share.share({
            title: 'Bookd Income Report',
            text: 'Your income report is ready',
            url: writeResult.uri,
            dialogTitle: 'Share or Save Report'
          });
          
          toast({
            title: "Report Ready",
            description: "Use the share options to save, email, or print to PDF.",
            duration: 5000,
          });
          return; // Exit after native handling
        } catch (nativeError) {
          console.warn('Native share failed, falling back to web download:', nativeError);
          // Fall through to web download if native fails
        }
      }
      
      // Web browser: use blob download (also fallback for failed native)
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: `${selectedPeriod === 'monthly' ? 'Monthly' : 
               selectedPeriod === 'quarterly' ? 'Quarterly' : 'Annual'} Income Report`,
        description: "Your report has been downloaded.",
        duration: 4000,
      });
      
    } catch (error) {
      console.error('Generate report error:', error);
      
      let errorMessage = "Failed to generate income report. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Report Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Get breakdown data for modals with safe parsing
  const getActualEarningsBreakdown = () => {
    if (!Array.isArray(currentPeriodGigs)) return [];
    const completedGigs = currentPeriodGigs.filter(gig => gig.status === "completed");
    const groupedGigs = getGroupedGigs(completedGigs);
    

    
    return groupedGigs
      .map(gig => {
        const payAmount = gig.actualPay ? safeParseFloat(gig.actualPay) : safeParseFloat(gig.expectedPay);
        const tips = safeParseFloat(gig.tips);
        const totalAmount = payAmount + tips;
        return {
          ...gig,
          amount: totalAmount,
          actualPay: payAmount,
          tips
        };
      })
      .filter(gig => gig.amount > 0)
      .sort((a, b) => parseGigDate(b.startDate || b.date).getTime() - parseGigDate(a.startDate || a.date).getTime());
  };

  const getProjectedEarningsBreakdown = () => {
    if (!Array.isArray(currentPeriodGigs)) return [];
    const groupedGigs = getGroupedGigs(currentPeriodGigs);
    
    // Calculate amount and filter/sort
    return groupedGigs
      .map(gig => {
        let amount = 0;
        if (gig.status === "completed") {
          const payAmount = gig.actualPay ? safeParseFloat(gig.actualPay) : safeParseFloat(gig.expectedPay);
          const tips = safeParseFloat(gig.tips);
          amount = payAmount + tips;
        } else {
          amount = safeParseFloat(gig.expectedPay);
        }
        return {
          ...gig,
          amount
        };
      })
      .filter(gig => gig.amount > 0)
      .sort((a, b) => parseGigDate(b.startDate || b.date).getTime() - parseGigDate(a.startDate || a.date).getTime());
  };

  const getTaxBreakdown = () => {
    if (!Array.isArray(currentPeriodGigs)) return [];
    const completedGigs = currentPeriodGigs.filter(gig => gig.status === "completed");
    const groupedGigs = getGroupedGigs(completedGigs);
    
    return groupedGigs.map(gig => {
      const income = safeParseFloat(gig.actualPay) + safeParseFloat(gig.tips);
      const taxRate = ((gig as any).taxRateUsed !== null && (gig as any).taxRateUsed !== undefined)
        ? Number((gig as any).taxRateUsed)
        : (gig.taxPercentage !== null && gig.taxPercentage !== undefined)
          ? gig.taxPercentage
          : (user?.defaultTaxPercentage || 28);
      const estimatedTax = income * (taxRate / 100);
      
      return {
        ...gig,
        amount: estimatedTax,
        taxableIncome: income,
        taxRate
      };
    })
    .filter(gig => gig.amount > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getTipsBreakdown = () => {
    return currentPeriodGigs
      .filter(gig => gig.status === "completed" && safeParseFloat(gig.tips) > 0)
      .map(gig => {
        const tips = safeParseFloat(gig.tips);
        return {
          ...gig,
          amount: tips
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getExpensesBreakdown = () => {
    // EXPENSE FIX: Use grouped gigs to prevent showing expenses multiple times for multi-day events
    const groupedGigs = getGroupedGigs(currentPeriodGigs);
    
    return groupedGigs
      .map(gig => {
        const parkingExpense = safeParseFloat(gig.parkingExpense);
        const otherExpenses = safeParseFloat(gig.otherExpenses);
        const mileageDeduction = (gig.mileage || 0) * 0.725; // 2026 IRS standard mileage rate
        const totalExpenses = parkingExpense + otherExpenses + mileageDeduction;
        
        return {
          ...gig,
          amount: totalExpenses,
          parkingExpense,
          otherExpenses,
          mileageDeduction
        };
      })
      .filter(gig => gig.amount > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getNewExpensesBreakdown = () => {
    const expenses = currentPeriodExpenses
      .map(expense => {
        const expenseAmount = safeParseFloat(expense.amount);
        const reimbursedAmount = safeParseFloat(expense.reimbursedAmount || '0');
        return {
          ...expense,
          amount: expenseAmount,
          parsedReimbursedAmount: reimbursedAmount,
          date: expense.date
        };
      })
      .filter(expense => expense.amount > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Create expense/reimbursement transparency breakdown
    const breakdown = [];
    
    for (const expense of expenses) {
      // Add the expense line item
      breakdown.push({
        ...expense,
        type: 'expense',
        displayAmount: expense.amount,
        isReimbursement: false
      });
      
      // Add reimbursement line item if there was any reimbursement
      if (expense.parsedReimbursedAmount > 0) {
        breakdown.push({
          ...expense,
          type: 'reimbursement',
          displayAmount: -expense.parsedReimbursedAmount, // Negative to show as reduction
          isReimbursement: true,
          businessPurpose: `Reimbursement: ${expense.businessPurpose}`,
          parsedReimbursedAmount: expense.parsedReimbursedAmount
        });
      }
    }
    
    return breakdown;
  };

  if (summaryLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show message when no gigs are found for this period
  if (!summaryLoading && summaryData?.totalGigs === 0 && user) {
    return (
      <div className="p-4 text-center space-y-4">
        {/* Date Navigation - so user can navigate away */}
        <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePeriod("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="font-semibold text-lg text-gray-900">{getPeriodText()}</div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePeriod("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-600">No Gigs Found</h2>
        <p className="text-gray-500">You don't have any gigs for this time period.</p>
        <Button 
          onClick={() => window.location.href = '/'}
          variant="default"
        >
          Add a Gig
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", paddingBottom: "160px", width: "100%", backgroundColor: "#f5f5f7", minHeight: "100vh" }}>

      {/* Period Toggle Pills — centered */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
        {(["monthly", "quarterly", "annual"] as const).map((p) => {
          const active = selectedPeriod === p;
          return (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              style={{
                padding: "8px 20px",
                width: "110px",
                borderRadius: "9999px",
                border: active ? "none" : "1px solid #e5e7eb",
                backgroundColor: active ? "#03045e" : "#ffffff",
                color: active ? "#ffffff" : "#4b5563",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              {p === "monthly" ? "Monthly" : p === "quarterly" ? "Quarterly" : "Annual"}
            </button>
          );
        })}
      </div>

      {/* Date Navigation — centered with flanking arrows */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "2px" }}>
          <button
            onClick={() => navigatePeriod("prev")}
            style={{ background: "none", border: "none", borderRadius: "8px", padding: "4px", cursor: "pointer", color: "#4b5563", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
            {getPeriodText()}
          </span>
          <button
            onClick={() => navigatePeriod("next")}
            style={{ background: "none", border: "none", borderRadius: "8px", padding: "4px", cursor: "pointer", color: "#4b5563", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {selectedPeriod === "quarterly" && (
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>
            {(() => {
              const quarter = getCurrentQuarter(currentDate);
              const year = currentDate.getFullYear();
              const nextYear = year + 1;
              const quarterRanges: Record<number, string> = {
                1: `Jan 1 – Mar 31 (Due Apr 15, ${year})`,
                2: `Apr 1 – May 31 (Due Jun 15, ${year})`,
                3: `Jun 1 – Aug 31 (Due Sep 15, ${year})`,
                4: `Sep 1 – Dec 31 (Due Jan 15, ${nextYear})`
              };
              return quarterRanges[quarter];
            })()}
          </div>
        )}
        <div style={{ fontSize: "14px", color: "#6b7280" }}>
          {periodStats.totalGigs} total gigs &bull; {periodStats.completedGigs} completed
        </div>
      </div>

      {/* Total Income Hero Card */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
          Total Income
        </div>
        <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827", marginBottom: "4px", lineHeight: 1.1 }}>
          ${periodStats.projectedEarnings.toFixed(2)}
        </div>
        {/* Completed / Pending split */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1, backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Completed</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>${periodStats.totalReceived.toFixed(2)}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#fafafa", borderRadius: "10px", padding: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Pending</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
              ${Math.max(0, periodStats.projectedEarnings - periodStats.totalReceived).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* YOUR SAVINGS THIS MONTH — flush section */}
      {(() => {
        const expData = getExpensesBreakdown();
        const totalMileageDollars = expData.reduce((sum, g) => sum + g.mileageDeduction, 0);
        const totalMiles = totalMileageDollars > 0 ? Math.round(totalMileageDollars / 0.725) : 0;
        const totalExpenseDollars = expData.reduce((sum, g) => sum + g.parkingExpense + g.otherExpenses, 0);
        return (
          <div style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #F0F0F0", padding: "16px", marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.8px", marginBottom: "12px" }}>
              Your Savings This Month
            </div>
            <div style={{ display: "flex", width: "100%" }}>
              {/* Left: Mileage */}
              <div style={{ flex: 1, paddingRight: "16px" }}>
                <Car size={18} color="#00b4d8" />
                <div style={{ fontSize: "13px", color: "#9B9B9B", marginTop: "4px" }}>Mileage</div>
                <div style={{ fontSize: "22px", fontWeight: 600, color: "#111111", marginTop: "2px" }}>${totalMileageDollars.toFixed(2)}</div>
                {totalMileageDollars > 0 ? (
                  <div style={{ fontSize: "12px", color: "#9B9B9B", marginTop: "2px" }}>{totalMiles} miles driven</div>
                ) : (
                  <div style={{ fontSize: "12px", color: "#00b4d8", marginTop: "2px", cursor: "pointer" }} onClick={() => onOpenAddGig?.()}>None logged yet</div>
                )}
              </div>
              {/* Vertical divider */}
              <div style={{ width: "1px", backgroundColor: "#F0F0F0", alignSelf: "stretch" }} />
              {/* Right: Expenses */}
              <div style={{ flex: 1, paddingLeft: "16px" }}>
                <Receipt size={18} color="#00b4d8" />
                <div style={{ fontSize: "13px", color: "#9B9B9B", marginTop: "4px" }}>Expenses</div>
                <div style={{ fontSize: "22px", fontWeight: 600, color: "#111111", marginTop: "2px" }}>${totalExpenseDollars.toFixed(2)}</div>
                {totalExpenseDollars > 0 ? (
                  <div style={{ fontSize: "12px", color: "#9B9B9B", marginTop: "2px" }}>logged this period</div>
                ) : (
                  <div style={{ fontSize: "12px", color: "#00b4d8", marginTop: "2px", cursor: "pointer" }} onClick={() => onOpenAddExpense?.()}>None logged yet</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hint text */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "0 2px" }}>
        <span style={{ fontSize: "16px" }}>💡</span>
        <span style={{ fontSize: "12px", color: "#111111" }}>Tap on each card below to see detailed breakdowns</span>
      </div>

      {/* Full-width stacked metric cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>

        {/* Taxable Income */}
        <div
          onClick={() => setShowEarningsBreakdown(true)}
          style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Taxable Income</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>${periodStats.actualEarnings.toFixed(2)}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>After reimbursements &bull; {periodStats.completedGigs} completed gig{periodStats.completedGigs !== 1 ? "s" : ""}</div>
          </div>
          <DollarSign size={22} color="#d1d5db" style={{ flexShrink: 0 }} />
        </div>

        {/* Expected Earnings */}
        <div
          onClick={() => setShowProjectedBreakdown(true)}
          style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Expected Earnings</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>${periodStats.projectedEarnings.toFixed(2)}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>From {periodStats.totalGigs} total gig{periodStats.totalGigs !== 1 ? "s" : ""} (includes upcoming)</div>
          </div>
          <TrendingUp size={22} color="#d1d5db" style={{ flexShrink: 0 }} />
        </div>

        {/* Tax Estimate */}
        <div
          onClick={() => setShowTaxBreakdown(true)}
          style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Tax Estimate</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>${periodStats.estimatedTax.toFixed(2)}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Estimated tax liability</div>
          </div>
          <FileText size={22} color="#d1d5db" style={{ flexShrink: 0 }} />
        </div>

        {/* Expenses */}
        <div
          onClick={() => setShowNewExpensesBreakdown(true)}
          style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Expenses</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>${periodStats.totalExpenses.toFixed(2)}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Total tracked expenses</div>
          </div>
          <Receipt size={22} color="#d1d5db" style={{ flexShrink: 0 }} />
        </div>
      </div>

      {/* Report CTA Card */}
      <div style={{
        backgroundColor: "#03045e",
        borderRadius: "20px",
        padding: "22px 20px 20px",
        marginBottom: "16px",
      }}>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: "16px" }}>
          Generate a comprehensive income report with earnings, expenses, and tax details
        </p>
        <button
          onClick={handleViewIncomeReport}
          disabled={isGeneratingPDF}
          data-testid="button-download-report"
          style={{
            backgroundColor: "#00b4d8",
            color: "#ffffff",
            border: "none",
            borderRadius: "100px",
            padding: "14px 20px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: isGeneratingPDF ? "not-allowed" : "pointer",
            opacity: isGeneratingPDF ? 0.7 : 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <FileText size={16} />
          {isGeneratingPDF ? "Loading…" : `Download ${selectedPeriod === "monthly" ? "Monthly" : selectedPeriod === "quarterly" ? "Quarterly" : "Annual"} Report`}
        </button>
      </div>

      {/* Goal Section - hidden from main dashboard view */}

      {/* Earnings Breakdown Modal */}
      <Dialog open={showEarningsBreakdown} onOpenChange={setShowEarningsBreakdown}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-none bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontSize: "22px", fontWeight: 700, color: "#111111" }}>Taxable Income Breakdown</DialogTitle>
            <DialogDescription style={{ fontSize: "13px", color: "#9B9B9B", maxWidth: "280px", lineHeight: 1.5 }}>
              View your total taxable income after deductions and reimbursements.
            </DialogDescription>
          </DialogHeader>
          <motion.div variants={containerVariants} initial="hidden" animate={showEarningsBreakdown ? "visible" : "hidden"} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getActualEarningsBreakdown().map((gig, index) => {
              const mileageDeduction = (gig.mileage || 0) * 0.725;
              return (
                <motion.div key={index} variants={cardVariants} style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>{gig.eventName || "Unnamed Gig"}</p>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>${gig.amount.toFixed(2)}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{gig.clientName}</p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                      {gig.isMultiDay
                        ? `${parseGigDate(gig.startDate!).toLocaleDateString()} - ${parseGigDate(gig.endDate!).toLocaleDateString()}`
                        : parseGigDate(gig.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ display: "inline-block", backgroundColor: "#00b4d8", color: "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px", marginTop: "6px" }}>
                    {gig.gigType}
                  </span>
                  {mileageDeduction > 0 && (
                    <div style={{ marginTop: "10px", borderTop: "1px solid #F0F0F0", paddingTop: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color: "#111111" }}>Mileage ({gig.mileage} mi)</span>
                        <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>-${mileageDeduction.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {getActualEarningsBreakdown().length === 0 && (
              <p className="text-center text-gray-500 py-4">No completed gigs yet</p>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Projected Earnings Breakdown Modal */}
      <Dialog open={showProjectedBreakdown} onOpenChange={setShowProjectedBreakdown}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-none bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontSize: "22px", fontWeight: 700, color: "#111111" }}>Projected Earnings Breakdown</DialogTitle>
            <DialogDescription style={{ fontSize: "13px", color: "#9B9B9B", maxWidth: "280px", lineHeight: 1.5 }}>
              View detailed breakdown of all gigs including completed and upcoming.
            </DialogDescription>
          </DialogHeader>
          <motion.div variants={containerVariants} initial="hidden" animate={showProjectedBreakdown ? "visible" : "hidden"} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getProjectedEarningsBreakdown().map((gig, index) => (
              <motion.div key={index} variants={cardVariants} style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>{gig.eventName || "Unnamed Gig"}</p>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>${gig.amount.toFixed(2)}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{gig.clientName}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                    {gig.isMultiDay
                      ? `${parseGigDate(gig.startDate!).toLocaleDateString()} - ${parseGigDate(gig.endDate!).toLocaleDateString()}`
                      : parseGigDate(gig.date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "inline-block", backgroundColor: "#00b4d8", color: "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px", marginTop: "6px" }}>
                    {gig.gigType}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 500, borderRadius: "9999px", padding: "3px 10px", backgroundColor: gig.status === "completed" ? "#d1fae5" : "#e0f2fe", color: gig.status === "completed" ? "#065f46" : "#0369a1" }}>
                    {gig.status}
                  </span>
                </div>
              </motion.div>
            ))}
            {getProjectedEarningsBreakdown().length === 0 && (
              <p className="text-center text-gray-500 py-4">No gigs found</p>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Tax Estimate Breakdown Modal */}
      <Dialog open={showTaxBreakdown} onOpenChange={setShowTaxBreakdown}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-none bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontSize: "22px", fontWeight: 700, color: "#111111" }}>Tax Estimate Breakdown</DialogTitle>
            <DialogDescription style={{ fontSize: "13px", color: "#9B9B9B", maxWidth: "280px", lineHeight: 1.5 }}>
              View detailed tax calculations for each gig based on income and tax rates.
            </DialogDescription>
          </DialogHeader>
          <motion.div variants={containerVariants} initial="hidden" animate={showTaxBreakdown ? "visible" : "hidden"} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getTaxBreakdown().map((gig, index) => (
              <motion.div key={index} variants={cardVariants} style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>{gig.eventName || "Unnamed Gig"}</p>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>${gig.amount.toFixed(2)}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{gig.clientName}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{parseGigDate(gig.date).toLocaleDateString()}</p>
                </div>
                <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 10px 0" }}>
                  Gross Income: ${gig.taxableIncome.toFixed(2)} × {gig.taxRate}%
                </p>
                <span style={{ display: "inline-block", backgroundColor: "#00b4d8", color: "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px", marginTop: "6px" }}>
                  {gig.gigType}
                </span>
              </motion.div>
            ))}
            {getTaxBreakdown().length === 0 && (
              <p className="text-center text-gray-500 py-4">No tax estimates available</p>
            )}
            
            {/* Legal Disclaimer */}
            <motion.div variants={cardVariants} style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "16px", marginTop: "6px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#B45309", margin: 0 }}>Tax Disclaimer</p>
              </div>
              <p style={{ fontSize: "13px", color: "#B45309", lineHeight: 1.6, margin: 0 }}>
                Tax estimates are calculated using your personal tax rate setting. Bookd does not provide tax advice. 
                These estimates are for informational purposes only. Please consult with a qualified tax professional 
                for accurate tax planning and filing guidance.
              </p>
            </motion.div>

            {/* Update Tax Rate Button */}
            <motion.div variants={cardVariants}>
              <button
                onClick={() => { setShowTaxBreakdown(false); setLocation("/profile"); }}
                style={{ display: "block", width: "100%", height: "52px", backgroundColor: "#03045e", color: "#ffffff", fontSize: "15px", fontWeight: 600, borderRadius: "9999px", border: "none", cursor: "pointer", marginTop: "20px", marginBottom: "8px" }}
              >
                Update Tax Rate in Profile ›
              </button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Tips Breakdown Modal */}
      <Dialog open={showTipsBreakdown} onOpenChange={setShowTipsBreakdown}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-none bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontSize: "22px", fontWeight: 700, color: "#111111" }}>Tips Earned Breakdown</DialogTitle>
            <DialogDescription style={{ fontSize: "13px", color: "#9B9B9B", maxWidth: "280px", lineHeight: 1.5 }}>
              View detailed breakdown of tips earned from completed gigs.
            </DialogDescription>
          </DialogHeader>
          <motion.div variants={containerVariants} initial="hidden" animate={showTipsBreakdown ? "visible" : "hidden"} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getTipsBreakdown().map((gig, index) => (
              <motion.div key={index} variants={cardVariants} style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>{gig.eventName || "Unnamed Gig"}</p>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>${gig.amount.toFixed(2)}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{gig.clientName}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{parseGigDate(gig.date).toLocaleDateString()}</p>
                </div>
                <span style={{ display: "inline-block", backgroundColor: "#00b4d8", color: "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px", marginTop: "6px" }}>
                  {gig.gigType}
                </span>
              </motion.div>
            ))}
            {getTipsBreakdown().length === 0 && (
              <p className="text-center text-gray-500 py-4">No tips earned yet</p>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Expenses Breakdown Modal */}
      <Dialog open={showExpensesBreakdown} onOpenChange={setShowExpensesBreakdown}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-none bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontSize: "22px", fontWeight: 700, color: "#111111" }}>Expenses Breakdown</DialogTitle>
            <DialogDescription style={{ fontSize: "13px", color: "#9B9B9B", maxWidth: "280px", lineHeight: 1.5 }}>
              View detailed breakdown of expenses including parking, other costs, and mileage deductions.
            </DialogDescription>
          </DialogHeader>
          <motion.div variants={containerVariants} initial="hidden" animate={showExpensesBreakdown ? "visible" : "hidden"} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getExpensesBreakdown().map((gig, index) => (
              <motion.div key={index} variants={cardVariants} style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>{gig.eventName || "Unnamed Gig"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>${gig.amount.toFixed(2)}</p>
                    <button onClick={() => setEditingGigExpense(gig)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#6b7280", display: "flex" }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => clearGigExpenses(gig.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#ef4444", display: "flex" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{gig.clientName}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                    {gig.isMultiDay
                      ? `${parseGigDate(gig.startDate!).toLocaleDateString()} - ${parseGigDate(gig.endDate!).toLocaleDateString()}`
                      : parseGigDate(gig.date).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ display: "inline-block", backgroundColor: "#00b4d8", color: "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px", marginTop: "6px", marginBottom: gig.parkingExpense > 0 || gig.otherExpenses > 0 || gig.mileageDeduction > 0 ? "10px" : "6px" }}>
                  {gig.gigType}
                </span>
                {(gig.parkingExpense > 0 || gig.otherExpenses > 0 || gig.mileageDeduction > 0) && (
                  <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {gig.parkingExpense > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color: "#111111" }}>Parking</span>
                        <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>-${gig.parkingExpense.toFixed(2)}</span>
                      </div>
                    )}
                    {gig.otherExpenses > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color: "#111111" }}>Other Expenses</span>
                        <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>-${gig.otherExpenses.toFixed(2)}</span>
                      </div>
                    )}
                    {gig.mileageDeduction > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color: "#111111" }}>Mileage ({gig.mileage} mi)</span>
                        <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>-${gig.mileageDeduction.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {getExpensesBreakdown().length === 0 && (
              <p className="text-center text-gray-500 py-4">No expenses recorded</p>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* New Standalone Expenses Breakdown Modal */}
      <Dialog open={showNewExpensesBreakdown} onOpenChange={setShowNewExpensesBreakdown}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-none bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontSize: "22px", fontWeight: 700, color: "#111111" }}>All Expenses Breakdown</DialogTitle>
            <DialogDescription style={{ fontSize: "13px", color: "#9B9B9B", maxWidth: "280px", lineHeight: 1.5 }}>
              View all expenses including standalone expenses and gig-related costs.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Standalone Expenses Section */}
            {getNewExpensesBreakdown().length > 0 && (
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Standalone Expenses</h4>
                <motion.div variants={containerVariants} initial="hidden" animate={showNewExpensesBreakdown ? "visible" : "hidden"} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {getNewExpensesBreakdown().map((item, index) => (
                    <motion.div key={`${item.type}-${item.id}-${index}`} variants={cardVariants} style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                        <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0, flex: 1 }}>{item.merchant}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>
                            {item.isReimbursement ? "-" : ""}${Math.abs(item.displayAmount).toFixed(2)}
                          </p>
                          {!item.isReimbursement && (
                            <>
                              <button
                                onClick={() => setEditingExpense({ ...item, amount: typeof item.amount === "number" ? item.amount.toString() : item.amount })}
                                disabled={updateExpenseMutation.isPending}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#6b7280", display: "flex" }}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => deleteExpenseMutation.mutate(item.id)}
                                disabled={deleteExpenseMutation.isPending}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#ef4444", display: "flex" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{item.businessPurpose}</p>
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ display: "inline-block", backgroundColor: item.isReimbursement ? "#d1fae5" : "#00b4d8", color: item.isReimbursement ? "#065f46" : "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px", marginTop: "6px" }}>
                          {item.isReimbursement ? "Reimbursement" : item.category || "Expense"}
                        </span>
                      </div>
                      {!item.isReimbursement && item.parsedReimbursedAmount > 0 && (
                        <div style={{ marginTop: "8px", borderTop: "1px solid #F0F0F0", paddingTop: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", color: "#111111" }}>Net out-of-pocket</span>
                            <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>${(item.amount - item.parsedReimbursedAmount).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Gig-Related Expenses Section */}
            {getExpensesBreakdown().length > 0 && (
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Gig-Related Expenses</h4>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate={showNewExpensesBreakdown ? "visible" : "hidden"}
                  transition={{
                    staggerChildren: 0.1,
                    delayChildren: 0.2 + getNewExpensesBreakdown().length * 0.1 + 0.3,
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  {getExpensesBreakdown().map((gig, index) => (
                    <motion.div key={`gig-${gig.id}`} variants={cardVariants} style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                        <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>{gig.eventName || "Unnamed Gig"}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0 }}>${gig.amount.toFixed(2)}</p>
                          <button onClick={() => setEditingGigExpense(gig)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#6b7280", display: "flex" }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => clearGigExpenses(gig.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#ef4444", display: "flex" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{gig.clientName}</p>
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                          {gig.isMultiDay
                            ? `${parseGigDate(gig.startDate!).toLocaleDateString()} - ${parseGigDate(gig.endDate!).toLocaleDateString()}`
                            : parseGigDate(gig.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{ display: "inline-block", backgroundColor: "#00b4d8", color: "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px", marginTop: "6px", marginBottom: gig.parkingExpense > 0 || gig.otherExpenses > 0 || gig.mileageDeduction > 0 ? "10px" : "6px" }}>
                        {gig.gigType}
                      </span>
                      {(gig.parkingExpense > 0 || gig.otherExpenses > 0 || gig.mileageDeduction > 0) && (
                        <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          {gig.parkingExpense > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "13px", color: "#111111" }}>Parking</span>
                              <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>-${gig.parkingExpense.toFixed(2)}</span>
                            </div>
                          )}
                          {gig.otherExpenses > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "13px", color: "#111111" }}>Other Expenses</span>
                              <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>-${gig.otherExpenses.toFixed(2)}</span>
                            </div>
                          )}
                          {gig.mileageDeduction > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "13px", color: "#111111" }}>Mileage ({gig.mileage} mi)</span>
                              <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>-${gig.mileageDeduction.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* No expenses found */}
            {getNewExpensesBreakdown().length === 0 && getExpensesBreakdown().length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No expenses found</p>
                <p className="text-sm">Add expenses to track your business costs</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update expense details and category information.
            </DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <ExpenseEditForm 
              expense={editingExpense}
              onSave={(data) => updateExpenseMutation.mutate({ id: editingExpense.id, data })}
              onCancel={() => setEditingExpense(null)}
              isLoading={updateExpenseMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Gig Expenses Dialog */}
      <Dialog open={!!editingGigExpense} onOpenChange={() => setEditingGigExpense(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gig Expenses</DialogTitle>
            <DialogDescription>
              Update parking, other expenses, and mileage for {editingGigExpense?.eventName}.
            </DialogDescription>
          </DialogHeader>
          {editingGigExpense && (
            <GigExpenseEditForm 
              gig={editingGigExpense}
              onSave={(data) => updateGigExpensesMutation.mutate({ id: editingGigExpense.id, data })}
              onCancel={() => setEditingGigExpense(null)}
              isLoading={updateGigExpensesMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Expense Edit Form Component
function ExpenseEditForm({ 
  expense, 
  onSave, 
  onCancel, 
  isLoading 
}: {
  expense: Expense;
  onSave: (data: ExpenseEditFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const hasReimbursement = Boolean(expense.reimbursedAmount && parseFloat(expense.reimbursedAmount) > 0);
  const [isReimbursed, setIsReimbursed] = useState(hasReimbursement);
  
  const form = useForm<ExpenseEditFormData>({
    resolver: zodResolver(editExpenseSchema),
    defaultValues: {
      date: expense.date,
      amount: expense.amount ? expense.amount.toString() : "0",
      merchant: expense.merchant || "",
      businessPurpose: expense.businessPurpose || "",
      category: expense.category,
      isReimbursed: hasReimbursement,
      reimbursedAmount: expense.reimbursedAmount || "0",
    },
  });

  const onSubmit = (data: ExpenseEditFormData) => {
    // If not reimbursed, set amount to 0
    if (!isReimbursed) {
      data.reimbursedAmount = "0";
    }
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Mobile-optimized form fields using reusable components */}
        <DateField control={form.control} />
        <AmountField control={form.control} />
        <MerchantField control={form.control} />
        <BusinessPurposeField control={form.control} />
        <CategoryField control={form.control} />
        
        {/* Reimbursement Section */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isReimbursed"
              checked={isReimbursed}
              onCheckedChange={(checked) => {
                setIsReimbursed(!!checked);
                if (!checked) {
                  form.setValue('reimbursedAmount', '0');
                }
              }}
            />
            <label htmlFor="isReimbursed" className="text-sm font-medium cursor-pointer">
              This expense was reimbursed
            </label>
          </div>
          
          {isReimbursed && (
            <FormField
              control={form.control}
              name="reimbursedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reimbursed Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7 text-base h-12 touch-manipulation"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Amount reimbursed by the client (not deductible)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 h-12 text-base font-medium touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 h-12 text-base font-medium touch-manipulation"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Gig Expense Edit Form Component
function GigExpenseEditForm({ 
  gig, 
  onSave, 
  onCancel, 
  isLoading 
}: {
  gig: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const form = useForm({
    defaultValues: {
      parkingExpense: typeof gig.parkingExpense === 'string' ? gig.parkingExpense : (gig.parkingExpense || 0).toString(),
      parkingDescription: gig.parkingDescription || "",
      parkingReimbursed: Boolean(gig.parkingReimbursed),
      otherExpenses: typeof gig.otherExpenses === 'string' ? gig.otherExpenses : (gig.otherExpenses || 0).toString(),
      otherExpenseDescription: gig.otherExpenseDescription || "",
      otherExpensesReimbursed: Boolean(gig.otherExpensesReimbursed),
      mileage: gig.mileage || 0,
    },
  });

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Parking Expense */}
        <FormField
          control={form.control}
          name="parkingExpense"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parking Expense</FormLabel>
              <FormControl>
                <CurrencyInput
                  placeholder="0.00"
                  className="text-base h-12 touch-manipulation"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parking Description */}
        <FormField
          control={form.control}
          name="parkingDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parking Description</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g., Downtown parking garage"
                  className="text-base h-12 touch-manipulation"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parking Reimbursed */}
        <FormField
          control={form.control}
          name="parkingReimbursed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Parking Reimbursed</FormLabel>
                <FormDescription>
                  Was this parking expense reimbursed by the client?
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Other Expenses */}
        <FormField
          control={form.control}
          name="otherExpenses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Expenses</FormLabel>
              <FormControl>
                <CurrencyInput
                  placeholder="0.00"
                  className="text-base h-12 touch-manipulation"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Other Expense Description */}
        <FormField
          control={form.control}
          name="otherExpenseDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Expense Description</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g., Equipment rental, supplies"
                  className="text-base h-12 touch-manipulation"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Other Expenses Reimbursed */}
        <FormField
          control={form.control}
          name="otherExpensesReimbursed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Other Expenses Reimbursed</FormLabel>
                <FormDescription>
                  Were these other expenses reimbursed by the client?
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Mileage */}
        <FormField
          control={form.control}
          name="mileage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mileage (Miles)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="text-base h-12 touch-manipulation"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Round-trip mileage for tax deduction (${(0.725 * (field.value || 0)).toFixed(2)} deduction)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 h-12 text-base font-medium touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 h-12 text-base font-medium touch-manipulation"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}