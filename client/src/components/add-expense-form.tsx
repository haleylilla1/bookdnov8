import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, X, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type Gig } from "@shared/schema";
import { addExpenseSchema, type ExpenseFormData, getTodayISO } from "@/lib/form-schemas";
import { AmountField, MerchantField, BusinessPurposeField, CategoryField, DateField } from "@/components/ui/form-field-wrapper";
import { useFormErrorHandler } from "@/hooks/use-form-error-handler";
import { CurrencyInput } from "@/components/ui/currency-input";

// Utility function to parse dates consistently across timezones
const parseGigDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

interface AddExpenseFormProps {
  onClose: () => void;
  linkedGigId?: number; // For gig-linked flow from "Got Paid"
}

export default function AddExpenseForm({ onClose, linkedGigId }: AddExpenseFormProps) {
  const { handleError, handleSuccess } = useFormErrorHandler();
  const queryClient = useQueryClient();

  // Get user's gigs for the dropdown  
  const { data: gigsResponse } = useQuery({
    queryKey: ["/api/gigs"],
  });
  
  // Handle both nested and direct array formats
  const gigs = Array.isArray(gigsResponse) 
    ? gigsResponse 
    : (gigsResponse && typeof gigsResponse === 'object' && 'gigs' in gigsResponse 
       ? (gigsResponse as any).gigs || [] 
       : []);
  
  // Debug log to understand data format
  console.log("🔍 Add Expense - Gigs data:", { gigsResponse, gigs: gigs.slice(0, 3), gigsLength: gigs.length });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      date: getTodayISO(),
      amount: "",
      category: "",
      merchant: "",
      businessPurpose: "",
      gigId: linkedGigId,
      isReimbursed: false,
      reimbursedAmount: "",
    },
  });

  const isReimbursed = form.watch("isReimbursed");

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      // Transform frontend fields to match API expectations
      const apiData = {
        description: `${data.merchant ? data.merchant + ' - ' : ''}${data.businessPurpose || data.merchant || 'Business expense'}`,
        merchant: data.merchant || 'Unknown', // Database requires merchant field
        businessPurpose: data.businessPurpose || 'Business expense', // Database requires business_purpose field
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.businessPurpose || '',
        gigId: data.gigId,
        reimbursedAmount: data.isReimbursed && data.reimbursedAmount ? data.reimbursedAmount : "0"
      };
      
      console.log("🔍 Sending expense data:", apiData);
      
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(`Failed to create expense: ${errorData.error || 'Unknown error'}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Immediately close to prevent UI freeze
      onClose();
      
      // Safari-optimized cache refresh - no setTimeout delay
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      handleSuccess("Expense added successfully!");
    },
    onError: (error) => {
      handleError(error, "add expense");
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 59 }}
        onClick={onClose}
      />
      {/* Slide-up sheet */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        height: "92dvh",
        backgroundColor: "#f5f7f5",
        borderRadius: "20px 20px 0 0",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        animation: "sheetSlideUp 0.32s cubic-bezier(0.32,0.72,0,1)",
      }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Pill handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "10px", paddingBottom: "4px", flexShrink: 0 }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#d1d5db" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 12px", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>
              {linkedGigId ? "Add Gig Expense" : "Add Expense"}
            </h2>
            <p style={{ fontSize: "13px", color: "#9ca3af", margin: "3px 0 0" }}>
              {linkedGigId ? "Track expenses for this gig" : "Track a business cost"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", minHeight: "unset", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", borderRadius: "50%" }}
          >
            <X size={22} />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
            <div className="flex-1 overflow-y-auto overscroll-behavior-contain px-6 min-h-0">
              <div className="space-y-6 py-4">
                {/* Mobile-optimized form fields with consistent touch sizing */}
                <DateField control={form.control} />
                <AmountField control={form.control} />
                <MerchantField control={form.control} />
                <BusinessPurposeField control={form.control} />
                <CategoryField control={form.control} />

                {/* Reimbursement Section */}
                <FormField
                  control={form.control}
                  name="isReimbursed"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="isReimbursed"
                          checked={field.value || false}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            if (e.target.checked) {
                              // Auto-fill with the expense amount
                              const currentAmount = form.getValues("amount");
                              form.setValue("reimbursedAmount", currentAmount || "");
                            } else {
                              form.setValue("reimbursedAmount", "");
                            }
                          }}
                          className="w-5 h-5 rounded border-2 border-gray-400 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer accent-green-600 checked:bg-green-600"
                        />
                        <label htmlFor="isReimbursed" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Was this reimbursed?
                        </label>
                      </div>
                    </FormItem>
                  )}
                />

                {isReimbursed && (
                  <FormField
                    control={form.control}
                    name="reimbursedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Reimbursement amount
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Gig Linking (Optional) */}
                {!linkedGigId && (
                  <FormField
                    control={form.control}
                    name="gigId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Link to gig? (optional)
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 text-base touch-manipulation">
                              <SelectValue placeholder="Select a gig (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="none" className="h-12 text-base touch-manipulation cursor-pointer">No gig selected</SelectItem>
                            {Array.isArray(gigs) && gigs.map((gig) => (
                              <SelectItem key={gig.id} value={gig.id.toString()} className="h-12 text-base touch-manipulation cursor-pointer">
                                {gig.eventName} - {gig.clientName} ({parseGigDate(gig.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {linkedGigId && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      This expense will be linked to your selected gig
                    </p>
                  </div>
                )}
                
                {/* Spacer for iOS keyboard scrolling */}
                <div className="h-[200px]" aria-hidden="true" />
              </div>
            </div>
            
            {/* Fixed bottom buttons - always visible */}
            <div className="border-t bg-white p-4 rounded-b-lg shrink-0">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 text-base font-medium touch-manipulation"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="flex-1 h-12 text-base font-medium touch-manipulation"
                >
                  {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      </div>
    </>
  );
}