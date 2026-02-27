import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Filter, Calendar, DollarSign, Clock, ChevronLeft, ChevronRight, Car, Calculator } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Gig } from "@shared/schema";
import { formatMonth, addMonths } from "@/lib/dateUtils";


import { AddressAutocomplete } from "./address-autocomplete";
import GotPaidDialog, { type GotPaidData } from "./got-paid-dialog";
import { MobileErrorBoundary } from "./error-boundary";
import GigEditForm from "./gig-edit-form";
import GigList from "./gig-list";
import DayGigDialog from "./day-gig-dialog";
import SimpleGigForm from "./simple-gig-form";

// Utility function to parse dates consistently across timezones (same as dashboard)
const parseGigDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00.000Z');
};

// Color mapping for gig status
const getGigStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "pending_payment":
    case "pending payment":
    case "pending":
    case "applied":
      return "bg-orange-500";
    case "upcoming":
    case "confirmed":
      return "bg-blue-500";
    default:
      return "bg-orange-500"; // Default to pending payment
  }
};

// Helper to get month key for tracking loaded months
const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export default function CalendarView() {
  const [editingGig, setEditingGig] = useState<(Gig & { isMultiDay?: boolean | null; startDate?: string | null; endDate?: string | null; gigIds?: number[] }) | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayGigs, setShowDayGigs] = useState(false);
  const [showAddGigDialog, setShowAddGigDialog] = useState(false);
  const [addGigDate, setAddGigDate] = useState<string | null>(null);
  const [gotPaidGig, setGotPaidGig] = useState<Gig | null>(null);
  const [showGotPaidDialog, setShowGotPaidDialog] = useState(false);
  const hasUpdatedStatusesRef = useRef(false);
  
  // Track loaded gigs and which months have been fetched
  const [allGigs, setAllGigs] = useState<Gig[]>([]);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initial load - fetch recent 50 gigs
  const { data: initialGigsResponse, isLoading } = useQuery<{ gigs: Gig[], total: number }>({
    queryKey: ["/api/gigs", "initial"],
    queryFn: () => fetch('/api/gigs?limit=50&offset=0').then(res => res.json()),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Initialize allGigs with initial response and mark those months as loaded
  useEffect(() => {
    if (initialGigsResponse?.gigs) {
      // Merge initial gigs with any already-fetched gigs (avoiding duplicates)
      setAllGigs(prev => {
        const existingIds = new Set(prev.map(g => g.id));
        const newGigs = initialGigsResponse.gigs.filter((g: Gig) => !existingIds.has(g.id));
        return [...prev, ...newGigs];
      });
      // Mark months from initial gigs as loaded
      setLoadedMonths(prev => {
        const newSet = new Set(prev);
        initialGigsResponse.gigs.forEach(gig => {
          const gigDate = new Date(gig.date);
          newSet.add(getMonthKey(gigDate));
        });
        return newSet;
      });
    }
  }, [initialGigsResponse]);

  // Fetch gigs for current month when navigating
  useEffect(() => {
    const monthKey = getMonthKey(currentDate);
    
    // Skip if month already loaded or currently loading
    if (loadedMonths.has(monthKey) || isLoadingMonth) return;
    
    const fetchMonthGigs = async () => {
      setIsLoadingMonth(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 2).padStart(2, '0')}-01`; // First of next month
        
        const response = await fetch(`/api/gigs?startDate=${startDate}&endDate=${endDate}`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.gigs && data.gigs.length > 0) {
          // Merge new gigs, avoiding duplicates
          setAllGigs(prev => {
            const existingIds = new Set(prev.map(g => g.id));
            const newGigs = data.gigs.filter((g: Gig) => !existingIds.has(g.id));
            return [...prev, ...newGigs];
          });
        }
        
        // Mark month as loaded even if no gigs found
        setLoadedMonths(prev => {
          const newSet = new Set(prev);
          newSet.add(monthKey);
          return newSet;
        });
      } catch (error) {
        console.error('Error fetching month gigs:', error);
      } finally {
        setIsLoadingMonth(false);
      }
    };
    
    fetchMonthGigs();
  }, [currentDate, loadedMonths, isLoadingMonth]);

  const gigs = allGigs;

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });

  // Mutation to automatically update gig statuses
  const updateGigStatusesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/gigs/update-statuses");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.updatedCount > 0) {
        // Refetch gigs to show updated statuses
        queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
      }
    },
    onError: (error) => {
    },
  });

  // Automatically update gig statuses when calendar loads (once per session)
  useEffect(() => {
    if (Array.isArray(gigs) && gigs.length > 0 && !hasUpdatedStatusesRef.current) {
      hasUpdatedStatusesRef.current = true;
      updateGigStatusesMutation.mutate();
    }
  }, [gigs?.length]); // Only run when gigs are initially loaded

  // Simple utility to refresh cache after mutations
  const refreshCache = () => {
    // Clear local state to force refetch
    setAllGigs([]);
    setLoadedMonths(new Set());
    queryClient.removeQueries({ queryKey: ["/api/gigs"] });
    queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
  };

  const updateGigMutation = useMutation({
    mutationFn: async (gigData: { id: number; data: Partial<Gig> }) => {
      const response = await apiRequest("PUT", `/api/gigs/${gigData.id}`, gigData.data);
      return response.json();
    },
    onSuccess: () => {
      // Immediately close to prevent UI freeze
      setEditingGig(null);
      
      // Background cache updates to prevent blocking
      setTimeout(() => {
        refreshCache();
      }, 100);
      
      toast({
        title: "Success",
        description: "Gig updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update gig. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteGigMutation = useMutation({
    mutationFn: async (gigId: number) => {
      await apiRequest("DELETE", `/api/gigs/${gigId}`);
    },
    onSuccess: () => {
      refreshCache();
      toast({
        title: "Success",
        description: "Gig deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete gig. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Memoize calendar days generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start on Sunday
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks worth of days
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  }, [currentDate]);

  // Memoize gigs by date for better performance - includes multi-day span expansion
  const gigsByDate = useMemo(() => {
    if (!gigs || !Array.isArray(gigs)) return new Map<string, Gig[]>();
    const gigMap = new Map<string, Gig[]>();
    
    const addGigToDate = (dateStr: string, gig: Gig) => {
      if (!gigMap.has(dateStr)) {
        gigMap.set(dateStr, []);
      }
      const existing = gigMap.get(dateStr)!;
      // Avoid duplicates
      if (!existing.some(g => g.id === gig.id)) {
        existing.push(gig);
      }
    };
    
    gigs.forEach(gig => {
      // Add gig to its primary date
      addGigToDate(gig.date, gig);
      
      // For multi-day gigs, also add to all dates in the span
      if (gig.isMultiDay && gig.startDate && gig.endDate) {
        const start = new Date(gig.startDate + 'T00:00:00');
        const end = new Date(gig.endDate + 'T00:00:00');
        
        // Loop through each day in the range (max 30 days to prevent runaway)
        for (let d = new Date(start); d <= end && d.getTime() - start.getTime() < 30 * 24 * 60 * 60 * 1000; d.setDate(d.getDate() + 1)) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          addGigToDate(dateStr, gig);
        }
      }
    });
    
    return gigMap;
  }, [gigs]);

  // Get gigs for a specific date - O(1) lookup from pre-computed map
  const getGigsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return gigsByDate.get(dateString) || [];
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    try {
      const dayGigs = getGigsForDate(date);
      if (dayGigs.length > 0) {
        setSelectedDate(date);
        setShowDayGigs(true);
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setAddGigDate(`${year}-${month}-${day}`);
        setShowAddGigDialog(true);
      }
    } catch (error) {
      console.error('Error handling day click:', error);
    }
  };

  // Navigation functions
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      return direction === "prev" ? addMonths(prev, -1) : addMonths(prev, 1);
    });
  };



  // Memoize filtered gigs for better performance
  const filteredGigs = useMemo(() => {
    if (!gigs || !Array.isArray(gigs)) return [];
    
    const filtered = gigs.filter(gig => {
      // Handle both "pending payment" and "pending_payment" status formats
      if (filterStatus !== "all") {
        const normalizedGigStatus = gig.status.replace('_', ' ');
        const normalizedFilterStatus = filterStatus.replace('_', ' ');
        if (normalizedGigStatus !== normalizedFilterStatus) return false;
      }
      if (searchQuery && 
          !gig.eventName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !gig.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Apply grouping to filtered gigs
    const sortedGigs = [...filtered].sort((a, b) => parseGigDate(a.date).getTime() - parseGigDate(b.date).getTime());
    const grouped: (Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string; gigIds?: number[] })[] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < sortedGigs.length; i++) {
      if (processed.has(sortedGigs[i].id)) continue;
      
      const currentGig = sortedGigs[i];
      const similarGigs = [currentGig];
      processed.add(currentGig.id);
      
      // Look for consecutive similar gigs (within 7 days and in chronological order)
      for (let j = i + 1; j < sortedGigs.length; j++) {
        const nextGig = sortedGigs[j];
        if (processed.has(nextGig.id)) continue;
        
        // Use consistent UTC date parsing to avoid timezone issues
        const lastGigDate = parseGigDate(similarGigs[similarGigs.length - 1].date);
        const nextDate = parseGigDate(nextGig.date);
        
        // Calculate days difference - must be positive (forward in time) and <= 7 days
        const dayDiff = (nextDate.getTime() - lastGigDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Smart grouping logic:
        // 1. If both have same multi_day_group_id - definitely group
        // 2. If same name/client/type and consecutive days (≤2 days apart) - likely multi-day gig
        // 3. But if they're >7 days apart - definitely separate gigs
        const bothHaveGroupId = currentGig.multiDayGroupId && nextGig.multiDayGroupId && 
                               currentGig.multiDayGroupId === nextGig.multiDayGroupId;
        const consecutiveDays = dayDiff > 0 && dayDiff <= 2; // Truly consecutive (next day or day after)
        const tooFarApart = dayDiff > 7; // Definitely separate gigs
        
        if (nextGig.eventName === currentGig.eventName &&
            nextGig.clientName === currentGig.clientName &&
            nextGig.gigType === currentGig.gigType &&
            (bothHaveGroupId || (consecutiveDays && !tooFarApart))) {
          similarGigs.push(nextGig);
          processed.add(nextGig.id);
        } else if (tooFarApart) {
          // Stop looking if we've exceeded the 7-day window
          break;
        }
      }
      
      if (similarGigs.length > 1) {
        similarGigs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const multiDayGig = {
          ...currentGig,
          isMultiDay: true,
          startDate: similarGigs[0].date,
          endDate: similarGigs[similarGigs.length - 1].date,
          gigIds: similarGigs.map(g => g.id)
        };
        grouped.push(multiDayGig);
      } else {
        grouped.push({
          ...currentGig,
          isMultiDay: currentGig.isMultiDay || false,
          startDate: currentGig.startDate || currentGig.date,
          endDate: currentGig.endDate || currentGig.date,
          gigIds: undefined
        });
      }
    }
    
    return grouped.sort((a, b) => parseGigDate(b.date).getTime() - parseGigDate(a.date).getTime());
  }, [gigs, filterStatus, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending_payment":
      case "pending payment":
        return "bg-orange-100 text-orange-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending_payment":
      case "pending payment":
        return "Pending Payment";
      case "upcoming":
        return "Upcoming";
      default:
        return status;
    }
  };

  const handleEditGig = (gig: Gig & { isMultiDay?: boolean | null; startDate?: string | null; endDate?: string | null; gigIds?: number[] }) => {
    // For multi-day gigs, ensure we populate gigIds using multiDayGroupId from database
    if (gig.isMultiDay || (gig as any).multiDayGroupId) {
      const multiDayGroupId = (gig as any).multiDayGroupId;
      if (multiDayGroupId && gigs) {
        // Find all gigs with the same multiDayGroupId
        const relatedGigs = gigs.filter(g => (g as any).multiDayGroupId === multiDayGroupId);
        
        if (relatedGigs.length > 1) {
          const sortedGigs = relatedGigs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setEditingGig({
            ...gig,
            isMultiDay: true,
            startDate: sortedGigs[0].date,
            endDate: sortedGigs[sortedGigs.length - 1].date,
            gigIds: sortedGigs.map(g => g.id)
          });
          return;
        }
      }
    }
    
    // Fallback: single gig or grouped gig already has gigIds
    setEditingGig(gig);
  };

  // Handle "Got Paid" workflow
  const handleGotPaid = (gig: Gig) => {
    // For multi-day gigs, we need to find the complete gig group
    if (gig.isMultiDay && (gig as any).gigIds && (gig as any).gigIds.length > 1) {
      // Use the grouped gig that includes all related IDs
      setGotPaidGig(gig);
    } else if ((gig as any).multiDayGroupId) {
      // If it's part of a multi-day group but not grouped yet, find all related gigs
      const relatedGigs = gigs.filter(g => 
        (g as any).multiDayGroupId === (gig as any).multiDayGroupId ||
        (g.eventName === gig.eventName && 
         g.clientName === gig.clientName && 
         g.gigType === gig.gigType)
      );
      
      if (relatedGigs.length > 1) {
        // Create a multi-day gig object with all related IDs
        const multiDayGig = {
          ...gig,
          isMultiDay: true,
          startDate: relatedGigs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date,
          endDate: relatedGigs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date,
          gigIds: relatedGigs.map(g => g.id)
        };
        setGotPaidGig(multiDayGig);
      } else {
        setGotPaidGig(gig);
      }
    } else {
      setGotPaidGig(gig);
    }
    setShowGotPaidDialog(true);
  };

  // Mutation for "Got Paid" workflow
  const gotPaidMutation = useMutation({
    mutationFn: async ({ gigId, data, gigIds }: { gigId: number; data: GotPaidData; gigIds?: number[] }) => {
      // For multi-day gigs, update all related gig entries
      if (gigIds && gigIds.length > 1) {
        const updatePromises = gigIds.map(async (id) => {
          const response = await apiRequest("POST", `/api/gigs/${id}/got-paid`, data);
          if (!response.ok) {
            throw new Error(`Failed to process payment for gig ${id}`);
          }
          return response.json();
        });
        return Promise.all(updatePromises);
      } else {
        // Single gig payment
        const response = await apiRequest("POST", `/api/gigs/${gigId}/got-paid`, data);
        if (!response.ok) {
          throw new Error("Failed to process payment");
        }
        return response.json();
      }
    },
    onSuccess: () => {
      // Close dialog and clean up state
      setShowGotPaidDialog(false);
      setGotPaidGig(null);
      
      // Ensure iOS scroll is properly restored before cache updates
      setTimeout(() => {
        // Force scroll restoration for mobile
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'auto' });
          // Second attempt with smooth scroll for better UX
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 50);
        }
      }, 50);
      
      // Delayed cache updates to prevent interference with scroll restoration
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      }, 200);
      
      toast({
        title: "Payment processed",
        description: gotPaidGig && (gotPaidGig as any).gigIds && (gotPaidGig as any).gigIds.length > 1 
          ? `Tax-smart calculations saved for all ${(gotPaidGig as any).gigIds.length} days of this multi-day gig.`
          : "Tax-smart calculations have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error processing payment",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // Helper function to generate date range (reused from gig-form)
  const generateDateRange = (startDate: string, endDate?: string): string[] => {
    if (!endDate || endDate === startDate) return [startDate];
    
    try {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [startDate];
      
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) return [startDate];
      
      const dates: string[] = [];
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    } catch {
      return [startDate];
    }
  };

  // Helper function to recreate multi-day gigs with new dates
  const recreateMultiDayGigs = async (gigIds: number[], startDate: string, endDate: string, updatePayload: any) => {
    try {
      // Delete existing gigs
      for (const gigId of gigIds) {
        const response = await apiRequest("DELETE", `/api/gigs/${gigId}`);
        if (!response.ok) throw new Error(`Failed to delete gig ${gigId}`);
      }
      
      // Create new gigs
      const newDates = generateDateRange(startDate, endDate);
      for (const date of newDates) {
        const gigData = {
          userId: (user as any)?.id,
          date,
          ...updatePayload,
          paymentMethod: editingGig!.paymentMethod || "Cash",
          notes: editingGig!.notes || null
        };
        
        const response = await apiRequest("POST", "/api/gigs", gigData);
        if (!response.ok) throw new Error(`Failed to create gig for ${date}`);
      }
      
      // Immediately close to prevent UI freeze
      setEditingGig(null);
      
      // Background cache updates to prevent blocking
      setTimeout(() => {
        refreshCache();
      }, 100);
      
      toast({
        title: "Multi-day gig recreated",
        description: `Created ${newDates.length} days from ${startDate} to ${endDate}`,
      });
    } catch (error) {
      console.error("Error recreating multi-day gigs:", error);
      toast({
        title: "Update failed",
        description: "Failed to update date range. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to update existing multi-day gigs
  const updateMultiDayGigs = async (gigIds: number[], updatePayload: any) => {
    try {
      const updatePromises = gigIds.map(async (gigId) => {
        try {
          const response = await apiRequest("PUT", `/api/gigs/${gigId}`, updatePayload);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update gig ${gigId}: ${errorText}`);
          }
          return await response.json();
        } catch (error) {
          console.error(`Error updating gig ${gigId}:`, error);
          throw error;
        }
      });
      
      await Promise.all(updatePromises);
      
      // Immediately close to prevent UI freeze
      setEditingGig(null);
      
      // Background cache updates to prevent blocking
      setTimeout(() => {
        refreshCache();
      }, 100);
      
      toast({
        title: "Multi-day gig updated",
        description: `Updated ${gigIds.length} days of ${editingGig!.eventName}`,
      });
    } catch (error) {
      console.error("Error updating multi-day gigs:", error);
      toast({
        title: "Update failed",
        description: `Failed to update gig: ${(error as Error).message}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    if (!editingGig) return;

    // Prepare update payload with safe numeric parsing
    const updatePayload: any = {
      eventName: updatedData.eventName?.trim() || editingGig.eventName,
      clientName: updatedData.clientName?.trim() || editingGig.clientName,
      gigType: updatedData.gigType?.trim() || editingGig.gigType,
      status: updatedData.status || editingGig.status,
      duties: updatedData.duties || null,
      taxPercentage: Math.max(0, Math.min(100, parseFloat(updatedData.taxPercentage) || 0)),
    };
    
    // Handle date field mapping for both single and multi-day gigs
    if (updatedData.startDate) {
      updatePayload.date = updatedData.startDate;
      updatePayload.startDate = updatedData.startDate; // Update startDate field too
    }
    if (updatedData.endDate) {
      updatePayload.endDate = updatedData.endDate; // Update endDate field too
    }
    
    // Safe numeric conversions - preserve exact string values
    const safeParseFloat = (value: string | number | undefined): string | null => {
      if (value === "" || value === null || value === undefined) return null;
      const stringValue = String(value);
      const parsed = parseFloat(stringValue);
      return isNaN(parsed) ? null : stringValue;
    };
    
    updatePayload.expectedPay = safeParseFloat(updatedData.expectedPay);
    updatePayload.actualPay = safeParseFloat(updatedData.actualPay);
    updatePayload.tips = safeParseFloat(updatedData.tips);
    updatePayload.parkingExpense = safeParseFloat(updatedData.parkingExpense);

    
    // Handle mileage calculation
    if (updatedData.calculatedMileage) {
      updatePayload.mileage = Math.max(0, parseInt(updatedData.calculatedMileage) || 0);
    } else {
      updatePayload.mileage = Math.max(0, parseInt(String(updatedData.mileage)) || 0);
    }
    
    // Handle receipts and reimbursement tracking
    if (updatedData.parkingDescription !== undefined) {
      updatePayload.parkingDescription = updatedData.parkingDescription;
    }

    
    // Add reimbursement tracking fields
    if (updatedData.parkingReimbursed !== undefined) {
      updatePayload.parkingReimbursed = Boolean(updatedData.parkingReimbursed);
    }
    
    // Save gig address for mileage reports
    if (updatedData.gigAddress !== undefined) {
      updatePayload.gigAddress = updatedData.gigAddress || null;
    }
    
    // Save round trip settings
    if (updatedData.isRoundTrip !== undefined) {
      updatePayload.isRoundTrip = Boolean(updatedData.isRoundTrip);
    }
    if (updatedData.isRoundTripEachDay !== undefined) {
      updatePayload.isRoundTripEachDay = Boolean(updatedData.isRoundTripEachDay);
    }

    // Handle multi-day gigs with efficient date change detection
    if (editingGig.isMultiDay && editingGig.gigIds?.length) {
      const datesChanged = (updatedData.startDate !== editingGig.startDate) || 
                          (updatedData.endDate !== editingGig.endDate);
      
      if (datesChanged) {
        // Recreate gig series with new dates
        await recreateMultiDayGigs(editingGig.gigIds, updatedData.startDate || editingGig.startDate!, 
                           updatedData.endDate || editingGig.endDate!, updatePayload);
      } else {
        // Update existing gigs in series
        await updateMultiDayGigs(editingGig.gigIds, updatePayload);
      }
    } else {
      // Single day gig
      updateGigMutation.mutate({ id: editingGig.id, data: updatePayload });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-6">
          {/* Calendar skeleton */}
          <div className="bg-gray-200 animate-pulse h-12 rounded-lg" />
          <div className="bg-gray-200 animate-pulse h-80 rounded-xl" />
          {/* Gig list skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-0 w-full space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {formatMonth(currentDate)}
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs text-blue-600 p-0 h-auto"
          >
            Back to current month
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="mb-6">
        <CardContent className="p-4 lg:p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2 border-b border-gray-100">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <MobileErrorBoundary>
            <div className="grid grid-cols-7 gap-1 calendar-grid">
              {calendarDays.map((date: Date, index: number) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const dayGigs = getGigsForDate(date);
              const hasGigs = dayGigs.length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && handleDayClick(date)}
                  className={`
                    calendar-day-button h-16 w-full p-2 text-sm relative transition-all duration-200 rounded-md border border-gray-100
                    ${isCurrentMonth 
                      ? hasGigs 
                        ? 'hover:bg-blue-50 cursor-pointer hover:border-blue-200 hover:shadow-sm bg-white' 
                        : isToday
                          ? 'text-blue-600 font-semibold hover:bg-blue-50 cursor-pointer bg-white'
                          : 'text-gray-700 hover:bg-gray-50 cursor-pointer bg-white'
                      : 'text-gray-300 bg-gray-50 cursor-default'
                    }
                  `}
                  disabled={!isCurrentMonth}
                  aria-label={`${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'long' })} ${date.getFullYear()}${hasGigs ? `, ${dayGigs.length} gig${dayGigs.length > 1 ? 's' : ''}` : ', tap to add a gig'}`}
                  tabIndex={isCurrentMonth ? 0 : -1}
                  style={{ 
                    /* iOS touch fix: explicit positioning */
                    WebkitTransform: 'none',
                    transform: 'none'
                  }}
                >
                  {/* Simplified touch-friendly structure */}
                  <div className="pointer-events-none flex flex-col items-center justify-center h-full">
                    <span className={`${isToday ? 'font-semibold' : ''} text-center`}>
                      {date.getDate()}
                    </span>
                    
                    {/* Gig indicators - simplified for iOS touch */}
                    {hasGigs && (
                      <div className="mt-1 flex items-center justify-center">
                        {dayGigs.length === 1 ? (
                          <div 
                            className={`w-2 h-2 rounded-full ${getGigStatusColor(dayGigs[0].status)}`}
                          />
                        ) : dayGigs.length === 2 ? (
                          <div className="flex gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${getGigStatusColor(dayGigs[0].status)}`} />
                            <div className={`w-1.5 h-1.5 rounded-full ${getGigStatusColor(dayGigs[1].status)}`} />
                          </div>
                        ) : (
                          <div className="flex gap-0.5">
                            {dayGigs.slice(0, 2).map((gig: Gig, gigIndex: number) => (
                              <div 
                                key={gigIndex}
                                className={`w-1.5 h-1.5 rounded-full ${getGigStatusColor(gig.status)}`}
                              />
                            ))}
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Today indicator */}
                    {isToday && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            Tap any date to view gigs or add a new one
          </div>
          </MobileErrorBoundary>
        </CardContent>
      </Card>

      {/* Gig Status Legend */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 text-gray-700">Gig Status Colors</h3>
          <div className="flex flex-wrap gap-4 text-xs mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0"></div>
              <span className="text-gray-600">Pending Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
              <span className="text-gray-600">Upcoming</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 pt-2 border-t">
            Tap any date to view gigs or add a new one
          </div>
        </CardContent>
      </Card>

      {/* Gig List Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">All Gigs</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {filteredGigs.length} gigs
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending payment">Pending Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gig List */}
      <GigList
        gigs={filteredGigs}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        hasMore={false}
        isLoadingMore={false}
        remainingCount={0}
        onLoadMore={() => {}}
        onGotPaid={handleGotPaid}
        onEdit={handleEditGig}
        onDelete={(gig) => {
          if (gig.isMultiDay && gig.gigIds) {
            gig.gigIds.forEach(id => deleteGigMutation.mutate(id));
          } else {
            deleteGigMutation.mutate(gig.id);
          }
        }}
        isDeleting={deleteGigMutation.isPending}
      />

      {/* Day Gigs Modal */}
      <DayGigDialog
        open={showDayGigs}
        onOpenChange={setShowDayGigs}
        selectedDate={selectedDate}
        gigs={selectedDate ? getGigsForDate(selectedDate) : []}
        groupedGigs={filteredGigs}
        onGotPaid={handleGotPaid}
        onEdit={handleEditGig}
        onDelete={(gigId, gigIds) => {
          if (gigIds) {
            gigIds.forEach(id => deleteGigMutation.mutate(id));
          } else {
            deleteGigMutation.mutate(gigId);
          }
        }}
        isDeleting={deleteGigMutation.isPending}
      />

      {/* Edit Gig Dialog */}
      <Dialog open={!!editingGig} onOpenChange={() => setEditingGig(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gig</DialogTitle>
            <DialogDescription>
              Update gig information, payments, and expense tracking.
            </DialogDescription>
          </DialogHeader>
          {editingGig && (
            <GigEditForm
              gig={editingGig}
              onSave={handleSaveEdit}
              onCancel={() => setEditingGig(null)}
              isLoading={updateGigMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Gig Form - triggered when tapping an empty date */}
      {showAddGigDialog && (
        <SimpleGigForm
          defaultDate={addGigDate || undefined}
          onClose={() => {
            setShowAddGigDialog(false);
            setAddGigDate(null);
            refreshCache();
          }}
        />
      )}

      {/* Got Paid Dialog */}
      {gotPaidGig && (
        <GotPaidDialog
          gig={gotPaidGig}
          isOpen={showGotPaidDialog}
          onClose={() => {
            setShowGotPaidDialog(false);
            setGotPaidGig(null);
          }}
          onSave={async (data) => {
            return gotPaidMutation.mutateAsync({ 
              gigId: gotPaidGig.id, 
              data,
              gigIds: (gotPaidGig as any).gigIds
            });
          }}
        />
      )}
    </div>
  );
}
