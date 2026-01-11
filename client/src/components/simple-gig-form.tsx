import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertGigSchema, type InsertGig, type User } from "@shared/schema";
import { z } from "zod";
import { X, Loader2, MapPin, Navigation } from "lucide-react";
import { AddressAutocomplete } from "@/components/address-autocomplete";

// Simplified form schema for planning gigs (detailed tracking happens in "Got Paid")
const gigFormSchema = z.object({
  gigType: z.string().min(1, "Gig type is required"),
  eventName: z.string().min(1, "Event name is required"),
  clientName: z.string().min(1, "Client name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  expectedPay: z.string().min(1, "Expected pay is required"),
  status: z.enum(["upcoming", "pending payment", "completed"]).default("upcoming"),
  duties: z.string().optional(),
  notes: z.string().optional(),
  gigAddress: z.string().optional(),
  isRoundTrip: z.boolean().optional(),
  isRoundTripEachDay: z.boolean().optional(),
}).refine((data) => {
  // If no end date provided, validation passes
  if (!data.endDate || data.endDate.trim() === "") {
    return true;
  }
  
  // Ensure end date is not before start date
  const start = new Date(data.startDate + 'T00:00:00');
  const end = new Date(data.endDate + 'T00:00:00');
  
  return end >= start;
}, {
  message: "End date cannot be before start date",
  path: ["endDate"], // Show error on the endDate field
});

type GigFormData = z.infer<typeof gigFormSchema>;

// Multi-day gig helper function
function generateDateRange(startDate: string, endDate?: string): string[] {
  const dates: string[] = [];
  
  // Single day gig
  if (!endDate?.trim() || endDate === startDate) {
    return [startDate];
  }

  // Multi-day gig
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  if (start > end) return [startDate];
  if (start.getTime() === end.getTime()) return [startDate];
  
  const current = new Date(start);
  let dayCount = 0;
  const MAX_DAYS = 30; // Safety limit
  
  while (current <= end && dayCount < MAX_DAYS) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
    dayCount++;
  }
  
  return dates;
}

interface SimpleGigFormProps {
  onClose: () => void;
}

export default function SimpleGigForm({ onClose }: SimpleGigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // BULLETPROOF USER FETCHING - Clear error handling, no silent failures
  const { 
    data: user, 
    isLoading: userLoading, 
    error: userError,
    isError
  } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false, // Don't retry auth failures
    queryFn: async () => {
      const response = await fetch("/api/user", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`Authentication failed (${response.status})`);
      }
      return response.json();
    }
  });

  // BULLETPROOF AUTH HANDLING - Always show clear feedback
  useEffect(() => {
    if (isError && userError) {
      console.log("🚨 Auth error detected:", userError.message);
      toast({
        title: "Authentication Required",
        description: "Please log in to add gigs",
        variant: "destructive"
      });
      
      // Always redirect to login on auth failure
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, [isError, userError, toast]);

  // Mutation to update user profile with new client
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await apiRequest("PUT", "/api/user", userData);
      return response.json();
    },
    onSuccess: async () => {
      // Refresh user data to get updated preferred clients
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  // Simplified form setup for planning gigs
  const form = useForm<GigFormData>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      gigType: "",
      eventName: "",
      clientName: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      expectedPay: "",
      status: "upcoming" as const,
      duties: "",
      notes: "",
      gigAddress: "",
      isRoundTrip: true,
      isRoundTripEachDay: false,
    }
  });

  // Update defaults when user loads
  useEffect(() => {
    if (user) {
      // No tax percentage in simplified form - handled in "Got Paid"
      // No address tracking in simplified form - just estimates
    }
  }, [user, form]);

  // Watch form values for conditional rendering
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  // State for client management
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  // MULTI-DAY GIG DETECTION - Simple and clear for users
  const multiDayInfo = useMemo(() => {
    if (!startDate) return { isMultiDay: false, dayCount: 1, dateRange: [] };

    if (!endDate?.trim() || endDate === startDate) {
      return { isMultiDay: false, dayCount: 1, dateRange: [startDate] };
    }

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    if (start > end || start.getTime() === end.getTime()) {
      return { isMultiDay: false, dayCount: 1, dateRange: [startDate] };
    }

    const dateRange = generateDateRange(startDate, endDate);
    const dayCount = dateRange.length;
    
    return { 
      isMultiDay: dayCount > 1, 
      dayCount, 
      dateRange 
    };
  }, [startDate, endDate]);



  // SIMPLE GIG CREATION MUTATION - Optimized for mobile stability
  const createGigMutation = useMutation({
    mutationFn: async (gigData: InsertGig) => {
      const response = await apiRequest("POST", "/api/gigs", gigData);
      return response;
    },
    onSuccess: async () => {
      // Immediately close to prevent UI freeze
      onClose();
      
      // Safari-optimized cache refresh - no setTimeout delay
      queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Success",
        description: "Gig created successfully!"
      });
    },
    onError: (error) => {
      console.error("Gig creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create gig. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Always reset loading state
      setIsSubmitting(false);
    }
  });

  // MOBILE-OPTIMIZED SUBMIT HANDLER - Prevents UI freezing
  const onSubmit = async (data: GigFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create gigs",
        variant: "destructive"
      });
      return;
    }

    // Prevent double submission
    if (isSubmitting || createGigMutation.isPending) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create SINGLE gig entry with date range (calendar will show dots on each day)
      const isMultiDay = data.endDate && data.endDate !== data.startDate;

      // DEBUG: Log expected pay value before submission
      console.log('🐛 DEBUG: expectedPay from form:', data.expectedPay, 'Type:', typeof data.expectedPay);

      const gigData: InsertGig = {
        userId: user.id,
        date: data.startDate, // Primary date (start date)
        startDate: data.startDate,
        endDate: data.endDate || data.startDate,
        isMultiDay: !!isMultiDay,
        multiDayGroupId: isMultiDay ? crypto.randomUUID() : null,
        gigType: data.gigType,
        eventName: data.eventName,
        clientName: data.clientName,
        expectedPay: data.expectedPay,
        actualPay: "0", // Will be set via "Got Paid" workflow
        tips: "0", // Will be set via "Got Paid" workflow
        paymentMethod: "Cash", // Default payment method, will be set via "Got Paid"
        status: data.status,
        duties: data.duties || null,
        taxPercentage: user.defaultTaxPercentage || 23, // Use user default
        mileage: 0, // Will be set via "Got Paid" workflow
        notes: data.notes || null,
        // Default values for fields handled by "Got Paid"
        parkingExpense: "0",
        parkingDescription: null,
        parkingReimbursed: false,
        otherExpenses: "0",
        otherExpenseDescription: null,
        otherExpensesReimbursed: false,
        // New "Got Paid" fields with defaults
        totalReceived: "0",
        reimbursedParking: "0",
        reimbursedOther: "0",
        unreimbursedParking: "0",
        unreimbursedOther: "0",
        gotPaidDate: null,
        // Mileage tracking fields (optional - can be set now or during Got Paid)
        gigAddress: data.gigAddress || null,
        isRoundTrip: data.isRoundTrip ?? true,
        isRoundTripEachDay: data.isRoundTripEachDay ?? false,
      };

      // Use mutation for proper state management
      createGigMutation.mutate(gigData);

      // Background: Save new client to preferred clients (non-blocking)
      if (data.clientName && user?.workPreferences && typeof user.workPreferences === 'object' && user.workPreferences !== null && 'preferredClients' in user.workPreferences) {
        const preferredClients = (user.workPreferences.preferredClients as string[]) || [];
        if (!preferredClients.includes(data.clientName)) {
          // Fire and forget - don't block the main flow
          apiRequest('POST', '/api/user/add-preferred-client', {
            clientName: data.clientName
          }).catch(() => {
            console.log("Note: Could not save client to preferences, but gig was created");
          });
        }
      }

    } catch (error) {
      console.error("Submit error:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to create gig. Please try again.",
        variant: "destructive"
      });
    }
  };

  // CLEAR LOADING STATE
  if (userLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading form...</span>
          </div>
        </div>
      </div>
    );
  }

  // CLEAR ERROR STATE
  if (isError || !user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to add gigs</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // MAIN FORM - Simple, clean, reliable
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden bg-white relative z-50 touch-manipulation rounded-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">Add New Gig</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
            <div className="flex-1 overflow-y-auto overscroll-behavior-contain px-4 min-h-0">
              <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gigType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gig Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="min-h-[48px] text-base bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          style={{
                            fontSize: '16px',
                            minHeight: '48px',
                            touchAction: 'manipulation',
                            WebkitAppearance: 'none'
                          }}
                        >
                          <SelectValue placeholder="Select gig type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent 
                        className="max-h-[300px] overflow-y-auto z-50"
                        position="popper"
                        sideOffset={4}
                      >
                        {(() => {
                          console.log("🔍 SimpleGigForm - User data:", user);
                          console.log("🔍 SimpleGigForm - CustomGigTypes:", user?.customGigTypes);
                          return user?.customGigTypes && user.customGigTypes.length > 0;
                        })() ? (
                          <>
                            {user.customGigTypes!.map((gigType) => (
                              <SelectItem 
                                key={gigType} 
                                value={gigType}
                                className="min-h-[44px] text-base cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                                style={{ fontSize: '16px', minHeight: '44px' }}
                              >
                                {gigType}
                              </SelectItem>
                            ))}
                            <SelectItem 
                              value="other"
                              className="min-h-[44px] text-base cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                              style={{ fontSize: '16px', minHeight: '44px' }}
                            >
                              Other
                            </SelectItem>
                          </>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">No gig types added yet.</p>
                            <p className="text-xs mt-1">Go to Profile → Add Type to create your custom gig types.</p>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Product Launch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name *</FormLabel>
                    <FormControl>
                      {showNewClientInput ? (
                        <div className="space-y-2">
                          <Input 
                            placeholder="Enter new client name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && newClientName.trim()) {
                                const clientName = newClientName.trim();
                                field.onChange(clientName);
                                
                                // Save new client to user profile
                                try {
                                  await apiRequest('POST', '/api/user/add-preferred-client', {
                                    clientName: clientName
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                                } catch (error) {
                                  console.log("Could not save client to preferences");
                                }
                                
                                setShowNewClientInput(false);
                                setNewClientName("");
                              } else if (e.key === 'Escape') {
                                setShowNewClientInput(false);
                                setNewClientName("");
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              size="sm" 
                              onClick={async () => {
                                if (newClientName.trim()) {
                                  const clientName = newClientName.trim();
                                  field.onChange(clientName);
                                  
                                  // Save new client to user profile
                                  try {
                                    await apiRequest('POST', '/api/user/add-preferred-client', {
                                      clientName: clientName
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                                  } catch (error) {
                                    console.log("Could not save client to preferences");
                                  }
                                  
                                  setShowNewClientInput(false);
                                  setNewClientName("");
                                }
                              }}
                              disabled={!newClientName.trim()}
                            >
                              Add Client
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setShowNewClientInput(false);
                                setNewClientName("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Select 
                          onValueChange={(value) => {
                            if (value === "__new_client__") {
                              setShowNewClientInput(true);
                            } else {
                              field.onChange(value);
                            }
                          }} 
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client or add new one" />
                          </SelectTrigger>
                          <SelectContent>
                            {(user?.workPreferences && typeof user.workPreferences === 'object' && user.workPreferences !== null && 'preferredClients' in user.workPreferences ? (user.workPreferences.preferredClients as string[]) : []).map((client: string) => (
                              <SelectItem 
                                key={client} 
                                value={client}
                                className="cursor-pointer"
                              >
                                {client}
                              </SelectItem>
                            ))}
                            <SelectItem value="__new_client__" className="font-medium text-blue-600">
                              + Add New Client
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-12 text-base cursor-pointer"
                        placeholder="Select start date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-12 text-base cursor-pointer"
                        placeholder="Select end date (optional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* MULTI-DAY INDICATOR */}
            {multiDayInfo.isMultiDay && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800 font-medium">
                    Multi-day gig: {multiDayInfo.dayCount} days ({new Date(startDate + 'T00:00:00').toLocaleDateString()} to {new Date(endDate + 'T00:00:00').toLocaleDateString()})
                  </span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  This will create one gig spanning {multiDayInfo.dayCount} days. Calendar will show dots on each day in the range.
                </p>
              </div>
            )}

            {/* Gig Location Section (Optional) */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">Mileage Tracking (Optional)</span>
              </div>
              <p className="text-sm text-gray-600">
                If you know the address, add it now. If not, you can add it once you get paid.
              </p>
              
              {/* Starting Location (from profile) */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  <Navigation className="w-4 h-4 inline mr-1" />
                  Starting from
                </label>
                <div className="p-3 bg-white border rounded-lg text-gray-700">
                  {user?.homeAddress || "Set your home address in Profile to auto-fill"}
                </div>
              </div>

              {/* Gig Location */}
              <FormField
                control={form.control}
                name="gigAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Gig Location
                    </FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        label=""
                        value={field.value || ""}
                        onChange={(address: string) => field.onChange(address)}
                        placeholder="Enter gig address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Round Trip Options */}
              {form.watch("gigAddress") && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="isRoundTrip"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="isRoundTrip"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer accent-blue-600"
                          />
                          <label htmlFor="isRoundTrip" className="text-sm font-medium cursor-pointer">
                            Round trip (doubles the distance)
                          </label>
                        </div>
                      </FormItem>
                    )}
                  />

                  {multiDayInfo.isMultiDay && form.watch("isRoundTrip") && (
                    <FormField
                      control={form.control}
                      name="isRoundTripEachDay"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3 ml-8">
                            <input
                              type="checkbox"
                              id="isRoundTripEachDay"
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="w-5 h-5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            />
                            <label htmlFor="isRoundTripEachDay" className="text-sm font-medium cursor-pointer">
                              Round trip each day ({multiDayInfo.dayCount} trips total)
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Payment Planning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedPay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Pay *</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        placeholder="250" 
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>




            {/* Duties */}
            <FormField
              control={form.control}
              name="duties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Duties</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Event setup, customer interaction, cleanup..."
                      className="min-h-[60px]"
                      enterKeyHint="done"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="pending payment">Pending Payment</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Planning Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800 font-medium">Planning Tool</span>
              </div>
              <p className="text-blue-700 text-sm">
                This form is for planning gigs. Use "Got Paid" on completed gigs for detailed payment tracking with tax-smart calculations.
              </p>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this gig..."
                      className="min-h-[80px]"
                      enterKeyHint="done"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Spacer for iOS keyboard scrolling */}
            <div className="h-[200px]" aria-hidden="true" />
              </div>
            </div>
            
            {/* Fixed bottom buttons - always visible */}
            <div className="border-t bg-white p-4 rounded-b-lg shrink-0">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-base font-medium touch-manipulation"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating gig...
                    </>
                  ) : (
                    multiDayInfo.isMultiDay 
                      ? `Save ${multiDayInfo.dayCount}-Day Gig` 
                      : "Save Gig"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 h-12 text-base font-medium touch-manipulation"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}