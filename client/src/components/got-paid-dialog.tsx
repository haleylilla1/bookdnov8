import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calculator, Receipt, CheckCircle, ArrowRight, ArrowLeft, Plus, X, Navigation, MapPin, Loader2, Save, XCircle } from "lucide-react";
import { FREQUENTLY_USED_CATEGORIES } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { apiRequest } from "@/lib/queryClient";

import type { Gig } from "@shared/schema";

interface GotPaidDialogProps {
  gig: Gig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GotPaidData) => Promise<void>;
}

export interface GotPaidData {
  totalReceived: number;
  mileage: number;
  parkingSpent: number;
  parkingReimbursed: number;
  otherExpenses: Array<{ 
    businessPurpose: string; 
    amount: number; 
    category: string;
    reimbursedAmount: number;
  }>;
  otherReimbursed: number;
  paymentMethod?: string;
  taxPercentage: number;
  gigAddress?: string;
  startingAddress?: string;
}

// Extract city and state from an address string (e.g., "313 16th St Huntington Beach CA 92648" -> "Huntington Beach, CA")
function extractCityFromAddress(address: string): string | undefined {
  if (!address) return undefined;
  
  // Common US state abbreviations
  const statePattern = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i;
  const match = address.match(statePattern);
  
  if (match) {
    const state = match[1].toUpperCase();
    const beforeState = address.substring(0, match.index).trim();
    // Get the last 1-3 words before the state (likely the city name)
    const words = beforeState.split(/\s+/);
    // Skip common street suffixes and take city name words
    const streetSuffixes = ['st', 'street', 'ave', 'avenue', 'blvd', 'boulevard', 'dr', 'drive', 'rd', 'road', 'ln', 'lane', 'ct', 'court', 'way', 'pl', 'place', 'cir', 'circle'];
    const cityWords = [];
    for (let i = words.length - 1; i >= 0 && cityWords.length < 3; i--) {
      const word = words[i].toLowerCase().replace(/[.,]/g, '');
      // Skip numbers and street suffixes
      if (!/^\d+$/.test(words[i]) && !streetSuffixes.includes(word)) {
        cityWords.unshift(words[i]);
      } else if (cityWords.length > 0) {
        // Stop if we hit a number or street suffix after finding city words
        break;
      }
    }
    if (cityWords.length > 0) {
      return `${cityWords.join(' ')}, ${state}`;
    }
  }
  return undefined;
}

export default function GotPaidDialog({ gig, isOpen, onClose, onSave }: GotPaidDialogProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Mileage calculation state
  const [startingAddress, setStartingAddress] = useState("");
  const [endingAddress, setEndingAddress] = useState("");
  const [resolvedStartAddress, setResolvedStartAddress] = useState("");
  const [resolvedEndAddress, setResolvedEndAddress] = useState("");
  const [startLat, setStartLat] = useState<number | undefined>();
  const [startLng, setStartLng] = useState<number | undefined>();
  const [startCity, setStartCity] = useState<string | undefined>();
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isPerDay, setIsPerDay] = useState(false);
  const [isCalculatingMileage, setIsCalculatingMileage] = useState(false);
  const [mileageError, setMileageError] = useState<string | null>(null);
  
  // Other expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    businessPurpose: "",
    amount: "",
    category: "",
    reimbursedAmount: ""
  });

  // Handle iOS dialog behavior
  React.useEffect(() => {
    if (isOpen) {
      // Import and use iOS fixes dynamically to avoid SSR issues
      import("../lib/ios-fixes").then(({ IOSMobileFixes }) => {
        IOSMobileFixes.handleDialogOpen();
      });
    } else {
      import("../lib/ios-fixes").then(({ IOSMobileFixes }) => {
        IOSMobileFixes.handleDialogClose();
      });
    }
  }, [isOpen]);

  // Fetch user data for default tax percentage
  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/user')
        .then(res => res.json())
        .then(userData => setUser(userData))
        .catch(err => {});
    }
  }, [isOpen]);

  // Use string-based form data for better input handling
  const [formData, setFormData] = useState({
    totalReceived: gig.expectedPay || "",
    mileage: gig.mileage ? gig.mileage.toString() : "",
    parkingSpent: gig.parkingExpense || "",
    parkingReimbursed: gig.parkingReimbursed ? (gig.parkingExpense || "") : "",
    otherExpenses: [] as Array<{ 
      businessPurpose: string; 
      amount: string; 
      category: string;
      reimbursedAmount: string;
    }>,
    otherReimbursed: "",
    paymentMethod: gig.paymentMethod || "",
    taxPercentage: gig.taxPercentage ? gig.taxPercentage.toString() : "25",
  });

  // Update tax percentage and addresses when user data loads
  React.useEffect(() => {
    if (user?.defaultTaxPercentage && !gig.taxPercentage) {
      setFormData(prev => ({ ...prev, taxPercentage: user.defaultTaxPercentage.toString() }));
    }
    if (user?.homeAddress) {
      setStartingAddress(user.homeAddress);
      setResolvedStartAddress(user.homeAddress);
      // Extract city for location biasing (simpler and more reliable than geocoding)
      const city = extractCityFromAddress(user.homeAddress);
      if (city) {
        setStartCity(city);
        console.log(`[GotPaid] Extracted city from home address: "${city}"`);
      }
    }
    if (gig.gigAddress) {
      setEndingAddress(gig.gigAddress);
    }
  }, [user, gig.taxPercentage, gig.gigAddress]);

  // Calculate mileage using Google Maps API
  const calculateMileage = async () => {
    if (!startingAddress || !endingAddress) return;

    setIsCalculatingMileage(true);
    setMileageError(null);

    try {
      // Use resolved addresses for accurate mileage (falls back to display address)
      const response = await apiRequest('POST', '/api/calculate-distance', {
        startAddress: resolvedStartAddress || startingAddress,
        endAddress: resolvedEndAddress || endingAddress,
        roundTrip: isRoundTrip
      });

      const data = await response.json();
      
      if (data.status === 'success' && data.distanceMiles) {
        let miles = Math.ceil(data.distanceMiles); // Round up for tax purposes
        
        // For multi-day gigs, multiply by number of days (already accounting for roundtrip)
        if (gig.isMultiDay && isPerDay) {
          const dayCount = calculateDayCount();
          miles = miles * dayCount;
        }
        
        setFormData(prev => ({ ...prev, mileage: miles.toString() }));
        setMileageError(null);
      } else {
        setMileageError(data.error || "Unable to calculate distance");
      }
    } catch (error) {
      setMileageError("Failed to calculate mileage. Please enter manually.");
    } finally {
      setIsCalculatingMileage(false);
    }
  };

  // Calculate number of days for multi-day gigs
  const calculateDayCount = () => {
    if (!gig.isMultiDay || !gig.startDate || !gig.endDate) return 1;
    
    const start = new Date(gig.startDate + 'T00:00:00');
    const end = new Date(gig.endDate + 'T00:00:00');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    return Math.max(1, diffDays);
  };

  // Helper to safely parse numbers from string inputs
  const parseNumber = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Simplified tax calculations - separate taxable income from business deductions
  const mileageDeduction = parseNumber(formData.mileage) * 0.70; // 2025 IRS standard mileage rate
  const totalOtherSpent = formData.otherExpenses.reduce((sum, exp) => sum + parseNumber(exp.amount), 0);
  const totalOtherReimbursed = formData.otherExpenses.reduce((sum, exp) => sum + parseNumber(exp.reimbursedAmount), 0);
  const calculations = {
    taxableIncome: parseNumber(formData.totalReceived) - parseNumber(formData.parkingReimbursed) - totalOtherReimbursed,
    businessDeductions: (parseNumber(formData.parkingSpent) - parseNumber(formData.parkingReimbursed)) + (totalOtherSpent - totalOtherReimbursed) + mileageDeduction,
    mileageDeduction,
    totalOtherSpent,
    totalOtherReimbursed
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convert strings back to numbers for saving
      const dataToSave: GotPaidData = {
        totalReceived: parseNumber(formData.totalReceived),
        mileage: parseNumber(formData.mileage),
        parkingSpent: parseNumber(formData.parkingSpent),
        parkingReimbursed: parseNumber(formData.parkingReimbursed),
        otherExpenses: formData.otherExpenses.map(exp => ({
          ...exp,
          amount: parseNumber(exp.amount),
          reimbursedAmount: parseNumber(exp.reimbursedAmount)
        })),
        otherReimbursed: parseNumber(formData.otherReimbursed),
        paymentMethod: formData.paymentMethod,
        taxPercentage: parseNumber(formData.taxPercentage),
        gigAddress: endingAddress || undefined,
        startingAddress: startingAddress || undefined,
      };
      
      await onSave(dataToSave);
      
      // Reset dialog state
      setStep(1);
      setStartingAddress("");
      setEndingAddress("");
      setResolvedStartAddress("");
      setResolvedEndAddress("");
      setIsRoundTrip(false);
      setIsPerDay(false);
      setMileageError(null);
      
      // Close dialog with proper cleanup
      onClose();
      
      // Safari optimization - remove aggressive scroll handling
      // Let React Query handle data refresh naturally
      
    } catch (error) {
      console.error('Got Paid save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const stepTitles = [
    "Total Payment",
    "Mileage Tracking", 
    "Parking Expenses",
    "Other Business Expenses",
    "Tax Rate & Payment",
    "Review & Confirm"
  ];

  // iOS scroll restoration now handled automatically by Dialog component

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Got Paid: {gig.eventName}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 6: {stepTitles[step - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6 flex-shrink-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded ${
                i + 1 <= step ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="space-y-4 pb-24">

        {/* Step 1: Total Payment */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How much did you receive total?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Expected pay: {formatCurrency(parseFloat(gig.expectedPay || "0"))}
                  </div>
                  <CurrencyInput
                    value={formData.totalReceived}
                    onChange={(value) => setFormData({ ...formData, totalReceived: value })}
                    placeholder="0.00"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">
                    Enter the total amount you received from the client, including any reimbursements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Mileage Tracking */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Mileage Tracking
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Calculate miles driven for tax deductions ({formatCurrency(parseNumber(formData.mileage) * 0.70)} at $0.70/mile)
                  {gig.isMultiDay && <span className="block mt-1 text-xs text-blue-600">Multi-day gig: Select "Calculate for each day" to multiply by {calculateDayCount()} days</span>}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address inputs */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Starting address</label>
                    <AddressAutocomplete
                      label=""
                      value={startingAddress}
                      onChange={(display, resolved, lat, lng) => {
                        setStartingAddress(display);
                        setResolvedStartAddress(resolved || display);
                        setStartLat(lat);
                        setStartLng(lng);
                        // Extract city from the selected address for location biasing
                        const city = extractCityFromAddress(resolved || display);
                        if (city) setStartCity(city);
                      }}
                      placeholder="Enter starting address or place name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination address</label>
                    <AddressAutocomplete
                      label=""
                      value={endingAddress}
                      onChange={(display, resolved) => {
                        setEndingAddress(display);
                        setResolvedEndAddress(resolved || display);
                      }}
                      placeholder="Enter gig location or venue name"
                      biasLat={startLat}
                      biasLng={startLng}
                      nearCity={startCity}
                    />
                  </div>
                </div>

                {/* Trip options */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-sm text-gray-700">Trip Options</h4>
                  
                  <div className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    isRoundTrip 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="roundTrip"
                      checked={isRoundTrip}
                      onChange={(e) => setIsRoundTrip(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer checked:bg-blue-600 checked:border-blue-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="roundTrip" className="text-sm font-medium cursor-pointer text-gray-900">
                        Round trip (doubles the distance)
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Check this if you need to return to your starting point
                      </p>
                    </div>
                  </div>
                  
                  {gig.isMultiDay && (
                    <div className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      isPerDay 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <input
                        type="checkbox"
                        id="perDay"
                        checked={isPerDay}
                        onChange={(e) => setIsPerDay(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer checked:bg-blue-600 checked:border-blue-600"
                      />
                      <div className="flex-1">
                        <label htmlFor="perDay" className="text-sm font-medium cursor-pointer text-gray-900">
                          Calculate for each day (×{calculateDayCount()} days)
                        </label>
                        <div className="text-xs text-gray-600 mt-1">
                          {isRoundTrip ? `= ${calculateDayCount()} roundtrips total` : `= ${calculateDayCount()} one-way trips total`}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!gig.isMultiDay && (
                    <p className="text-xs text-gray-500">
                      For multi-day gigs, you'll also see a "per day" calculation option.
                    </p>
                  )}
                </div>

                {/* Calculate button */}
                <Button
                  type="button"
                  onClick={calculateMileage}
                  disabled={!startingAddress || !endingAddress || isCalculatingMileage}
                  className="w-full"
                >
                  {isCalculatingMileage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate Mileage
                    </>
                  )}
                </Button>

                {/* Error display */}
                {mileageError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                    {mileageError}
                  </div>
                )}

                {/* Manual mileage input */}
                <div>
                  <label className="block text-sm font-medium mb-1">Total miles (or enter manually)</label>
                  <CurrencyInput
                    value={formData.mileage}
                    onChange={(value) => setFormData({ ...formData, mileage: value })}
                    placeholder="0"
                  />
                </div>

                {/* Deduction preview */}
                {parseNumber(formData.mileage) > 0 && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <Calculator className="w-3 h-3 mr-1" />
                    Tax deduction: {formatCurrency(parseNumber(formData.mileage) * 0.70)} ({formData.mileage} miles × $0.70)
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Parking Expenses */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Parking Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount you spent on parking</label>
                  <CurrencyInput
                    value={formData.parkingSpent}
                    onChange={(value) => setFormData({ ...formData, parkingSpent: value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount reimbursed by client</label>
                  <CurrencyInput
                    value={formData.parkingReimbursed}
                    onChange={(value) => setFormData({ ...formData, parkingReimbursed: value })}
                    placeholder="0.00"
                  />
                </div>
                {parseNumber(formData.parkingSpent) - parseNumber(formData.parkingReimbursed) > 0 && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    Business deduction: {formatCurrency(parseNumber(formData.parkingSpent) - parseNumber(formData.parkingReimbursed))}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Other Business Expenses */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Other Business Expenses
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Add any other business expenses from this gig (meals, equipment, supplies, etc.)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing other expenses list */}
                {formData.otherExpenses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Added Expenses:</h4>
                    {formData.otherExpenses.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{expense.businessPurpose}</div>
                          <div className="text-xs text-gray-600">{expense.category}</div>
                          <div className="text-sm">
                            Cost: {formatCurrency(parseNumber(expense.amount))} 
                            {parseNumber(expense.reimbursedAmount) > 0 && (
                              <span className="text-green-600"> • Reimbursed: {formatCurrency(parseNumber(expense.reimbursedAmount))}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExpenses = formData.otherExpenses.filter((_, i) => i !== index);
                            setFormData({ 
                              ...formData, 
                              otherExpenses: newExpenses,
                              otherReimbursed: newExpenses.reduce((sum, exp) => sum + parseNumber(exp.reimbursedAmount), 0).toString()
                            });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add expense form */}
                {!showExpenseForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowExpenseForm(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business Expense
                  </Button>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Add New Expense</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowExpenseForm(false);
                          setNewExpense({
                            businessPurpose: "",
                            amount: "",
                            category: "",
                            reimbursedAmount: ""
                          });
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Business purpose */}
                    <div>
                      <label className="block text-sm font-medium mb-1">What was this expense for?</label>
                      <Input
                        type="text"
                        value={newExpense.businessPurpose}
                        onChange={(e) => setNewExpense({ ...newExpense, businessPurpose: e.target.value })}
                        placeholder="e.g., Business lunch, Equipment rental"
                        className="text-base"
                      />
                    </div>
                    
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount spent</label>
                      <CurrencyInput
                        value={newExpense.amount}
                        onChange={(value) => setNewExpense({ ...newExpense, amount: value })}
                        placeholder="0.00"
                        className="text-base"
                      />
                    </div>
                    
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Business category</label>
                      <Select
                        value={newExpense.category}
                        onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                      >
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENTLY_USED_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="Promo & Marketing">Promo & Marketing</SelectItem>
                          <SelectItem value="Platform or Payment Fees">Platform or Payment Fees</SelectItem>
                          <SelectItem value="Office Expenses">Office Expenses</SelectItem>
                          <SelectItem value="Other Expenses">Other Expenses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Reimbursed amount */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount reimbursed by client</label>
                      <CurrencyInput
                        value={newExpense.reimbursedAmount}
                        onChange={(value) => setNewExpense({ ...newExpense, reimbursedAmount: value })}
                        placeholder="0.00"
                        className="text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter 0 if not reimbursed</p>
                    </div>
                    
                    {/* Save button */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowExpenseForm(false);
                          setNewExpense({
                            businessPurpose: "",
                            amount: "",
                            category: "",
                            reimbursedAmount: ""
                          });
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const amount = parseNumber(newExpense.amount);
                          const reimbursedAmount = Math.min(parseNumber(newExpense.reimbursedAmount), amount);
                          
                          if (!newExpense.businessPurpose.trim()) {
                            alert("Please enter what the expense was for");
                            return;
                          }
                          if (amount <= 0) {
                            alert("Please enter a valid amount");
                            return;
                          }
                          if (!newExpense.category) {
                            alert("Please select a category");
                            return;
                          }
                          
                          const expense = {
                            businessPurpose: newExpense.businessPurpose.trim(),
                            amount: amount.toString(),
                            category: newExpense.category,
                            reimbursedAmount: reimbursedAmount.toString()
                          };
                          
                          const newExpenses = [...formData.otherExpenses, expense];
                          setFormData({ 
                            ...formData, 
                            otherExpenses: newExpenses,
                            otherReimbursed: newExpenses.reduce((sum, exp) => sum + parseNumber(exp.reimbursedAmount), 0).toString()
                          });
                          
                          // Reset form
                          setShowExpenseForm(false);
                          setNewExpense({
                            businessPurpose: "",
                            amount: "",
                            category: "",
                            reimbursedAmount: ""
                          });
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Summary */}
                {formData.otherExpenses.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Total spent: {formatCurrency(formData.otherExpenses.reduce((sum, exp) => sum + parseNumber(exp.amount), 0))}</div>
                      <div>Total reimbursed: {formatCurrency(parseNumber(formData.otherReimbursed))}</div>
                      <div className="font-medium">Your cost: {formatCurrency(formData.otherExpenses.reduce((sum, exp) => sum + parseNumber(exp.amount), 0) - parseNumber(formData.otherReimbursed))}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Tax Rate & Payment Method */}
        {step === 5 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Rate
                </CardTitle>
                <p className="text-sm text-gray-600">Set your tax rate for this gig</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tax percentage</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.taxPercentage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setFormData({ ...formData, taxPercentage: "" });
                        } else if (/^\d*$/.test(value)) {
                          const numValue = parseInt(value);
                          if (numValue >= 0 && numValue <= 100) {
                            setFormData({ ...formData, taxPercentage: value });
                          }
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-20"
                      placeholder="Enter %"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your default is {user?.defaultTaxPercentage || 25}%. You can adjust for this specific gig.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Estimated tax amount:</div>
                  <div className="font-bold text-blue-700">
                    {formatCurrency(calculations.taxableIncome * (parseNumber(formData.taxPercentage) / 100))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on taxable income only (deductions tracked separately)
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium mb-2">How did you get paid? (optional)</label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                      <SelectItem value="venmo">Venmo</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="zelle">Zelle</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 6: Summary & Confirmation */}
        {step === 6 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Income Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Received:</span>
                    <div className="font-semibold">{formatCurrency(parseNumber(formData.totalReceived))}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Reimbursements:</span>
                    <div className="font-semibold">{formatCurrency(parseNumber(formData.parkingReimbursed) + parseNumber(formData.otherReimbursed))}</div>
                  </div>
                  <div className="col-span-2 pt-2 border-t">
                    <span className="text-gray-600">Taxable Income:</span>
                    <div className="text-lg font-bold text-green-600">{formatCurrency(calculations.taxableIncome)}</div>
                  </div>
                </div>

                {/* Tax Estimate */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Estimated tax ({formData.taxPercentage}%):</div>
                  <div className="text-lg font-bold text-green-700">
                    {formatCurrency(calculations.taxableIncome * (parseNumber(formData.taxPercentage) / 100))}
                  </div>
                </div>

                {/* Business Deductions (Informational) */}
                {calculations.businessDeductions > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="text-sm font-medium text-blue-800 mb-2">Potential Business Deductions:</div>
                    <div className="text-lg font-bold text-blue-700 mb-2">{formatCurrency(calculations.businessDeductions)}</div>
                    <div className="text-xs text-blue-600 space-y-1">
                      {parseNumber(formData.mileage) > 0 && (
                        <div>• Mileage: {formData.mileage} miles × $0.70 = {formatCurrency(calculations.mileageDeduction)}</div>
                      )}
                      {parseNumber(formData.parkingSpent) - parseNumber(formData.parkingReimbursed) > 0 && (
                        <div>• Parking: {formatCurrency(parseNumber(formData.parkingSpent) - parseNumber(formData.parkingReimbursed))}</div>
                      )}
                      {calculations.totalOtherSpent - calculations.totalOtherReimbursed > 0 && (
                        <div>• Other expenses: {formatCurrency(calculations.totalOtherSpent - calculations.totalOtherReimbursed)}</div>
                      )}
                      <div className="text-xs text-blue-500 mt-2 italic">Track these for tax filing - not included in tax estimate above</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Spacer for iOS keyboard scrolling */}
        <div className="h-[200px]" aria-hidden="true" />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t bg-white sticky bottom-0">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 min-h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          {step < 6 ? (
            <Button 
              onClick={nextStep} 
              className="flex items-center gap-2 min-h-12 px-6 bg-primary hover:bg-primary/90"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 min-h-12 px-6"
            >
              <CheckCircle className="w-4 h-4" />
              {isLoading ? "Saving..." : "Confirm Payment"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}