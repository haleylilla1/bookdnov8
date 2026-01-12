import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Gig } from "@shared/schema";
import { AddressAutocomplete } from "./address-autocomplete";

export interface GigEditFormProps {
  gig: Gig & { isMultiDay?: boolean | null; startDate?: string | null; endDate?: string | null; gigIds?: number[] };
  onSave: (data: Partial<Gig>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function GigEditForm({ gig, onSave, onCancel, isLoading }: GigEditFormProps) {
  const { toast } = useToast();
  const { data: user } = useQuery({ 
    queryKey: ["/api/user"],
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [formData, setFormData] = useState({
    eventName: gig.eventName,
    clientName: gig.clientName,
    gigType: gig.gigType,
    startDate: gig.isMultiDay ? gig.startDate! : gig.date,
    endDate: gig.isMultiDay ? gig.endDate! : "",
    expectedPay: gig.expectedPay || "",
    actualPay: gig.actualPay || "",
    tips: gig.tips || "",
    status: gig.status,
    duties: gig.duties || "",
    taxPercentage: (gig.taxPercentage !== null && gig.taxPercentage !== undefined) ? gig.taxPercentage.toString() : ((user as any)?.defaultTaxPercentage?.toString() || "23"),
    mileage: gig.mileage || 0,
    startingAddress: (user as any)?.homeAddress || "",
    endingAddress: gig.gigAddress || "",
    resolvedStartAddress: "",
    resolvedEndAddress: gig.gigAddress || "",
    startLat: undefined as number | undefined,
    startLng: undefined as number | undefined,
    stops: [] as string[],
    includeRoundtrip: gig.isRoundTrip ?? true,
    roundTripEachDay: gig.isRoundTripEachDay ?? false,
    calculatedMileage: "",
    parkingExpense: gig.parkingExpense || "",
    parkingDescription: gig.parkingDescription || "",
    parkingReimbursed: (gig as any).parkingReimbursed || false,
  });

  const [isCalculatingMileage, setIsCalculatingMileage] = useState(false);

  useEffect(() => {
    if (formData.startingAddress && !formData.startLat) {
      fetch(`/api/geocode?address=${encodeURIComponent(formData.startingAddress)}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.lat && data?.lng) {
            setFormData(prev => ({ ...prev, startLat: data.lat, startLng: data.lng }));
          }
        })
        .catch(() => {});
    }
  }, [formData.startingAddress]);

  const handleCalculateMileage = async () => {
    if (!formData.startingAddress?.trim() || !formData.endingAddress?.trim()) {
      toast({
        title: "Missing Addresses",
        description: "Both starting and ending addresses are required for mileage calculation.",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculatingMileage(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const { calculateDistance } = await import('../lib/distance');
      
      const result = await calculateDistance(
        (formData.resolvedStartAddress || formData.startingAddress).trim(),
        (formData.resolvedEndAddress || formData.endingAddress).trim(),
        formData.stops.filter(stop => stop?.trim()),
        formData.includeRoundtrip
      );

      clearTimeout(timeoutId);

      if (result.status === 'error') {
        throw new Error(result.error || 'Failed to calculate distance');
      }
      
      let roundedDistance = Math.ceil(result.distanceMiles);
      
      let dayCount = 1;
      if (gig.isMultiDay && formData.roundTripEachDay && gig.startDate && gig.endDate) {
        const start = new Date(gig.startDate + 'T00:00:00');
        const end = new Date(gig.endDate + 'T00:00:00');
        dayCount = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        roundedDistance = roundedDistance * dayCount;
      }
      
      setFormData(prev => ({ 
        ...prev, 
        calculatedMileage: roundedDistance.toString(),
        mileage: roundedDistance 
      }));
      
      if (result.status === 'success') {
        const dayText = dayCount > 1 ? ` × ${dayCount} days` : '';
        toast({
          title: "Mileage Calculated",
          description: `${roundedDistance} miles total${formData.includeRoundtrip ? ' (round trip)' : ''}${dayText}${result.fromCache ? ' (from cache)' : ''}.`,
        });
      } else {
        toast({
          title: "Distance Calculated (with warnings)",
          description: `${roundedDistance} miles calculated. Some segments may be estimated.`,
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error("Mileage calculation error:", error);
      
      let errorMessage = "Failed to calculate mileage. Please check your addresses and try again.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Calculation timeout. Please check your internet connection and try again.";
        } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = "Calculation timeout. Please check your internet connection and try again.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('Invalid response')) {
          errorMessage = "Invalid address. Please check your addresses and try again.";
        }
      }
      
      toast({
        title: "Calculation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCalculatingMileage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      gigAddress: formData.endingAddress || null,
      isRoundTrip: formData.includeRoundtrip,
      isRoundTripEachDay: formData.roundTripEachDay,
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name</label>
          <Input
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            placeholder="Corporate Event"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Client Name</label>
          <Input
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="ABC Company"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Gig Type</label>
        <Select 
          value={formData.gigType} 
          onValueChange={(value) => setFormData({ ...formData, gigType: value })}
        >
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
          <SelectContent 
            className="max-h-[300px] overflow-y-auto z-50"
            position="popper"
            sideOffset={4}
          >
            {(user as any)?.customGigTypes && (user as any).customGigTypes.length > 0 ? (
              <>
                {(user as any).customGigTypes.map((gigType: string) => (
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Expected Pay</label>
          <Input
            type="number"
            value={formData.expectedPay}
            onChange={(e) => setFormData({ ...formData, expectedPay: e.target.value })}
            placeholder="300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Actual Pay</label>
          <Input
            type="number"
            value={formData.actualPay}
            onChange={(e) => setFormData({ ...formData, actualPay: e.target.value })}
            placeholder="285"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tips</label>
          <Input
            type="number"
            value={formData.tips}
            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
            placeholder="25"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Tax Percentage</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="50"
            value={formData.taxPercentage}
            onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
            placeholder="25.0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mileage</label>
          <Input
            type="number"
            min="0"
            value={formData.mileage === 0 ? '' : formData.mileage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setFormData({ ...formData, mileage: 0 });
              } else {
                const parsed = parseInt(value);
                if (!isNaN(parsed) && parsed >= 0) {
                  setFormData({ ...formData, mileage: parsed });
                }
              }
            }}
            placeholder="45"
          />
        </div>
      </div>

      <div className="border-t pt-3 space-y-3">
        <h4 className="font-medium text-sm">Mileage Calculation</h4>
        
        <div className="grid grid-cols-1 gap-3">
          <AddressAutocomplete
            label="Starting Address"
            placeholder="Your home or starting location..."
            value={formData.startingAddress}
            onChange={(display, resolved, lat, lng) => setFormData({ 
              ...formData, 
              startingAddress: display,
              resolvedStartAddress: resolved || display,
              startLat: lat,
              startLng: lng
            })}
          />
          <AddressAutocomplete
            label="Ending Address" 
            placeholder="Event venue or destination..."
            value={formData.endingAddress}
            onChange={(display, resolved) => setFormData({ 
              ...formData, 
              endingAddress: display,
              resolvedEndAddress: resolved || display
            })}
            biasLat={formData.startLat}
            biasLng={formData.startLng}
          />
        </div>

        <div className="space-y-2">
          <div 
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              formData.includeRoundtrip 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setFormData({ ...formData, includeRoundtrip: !formData.includeRoundtrip })}
          >
            <input
              type="checkbox"
              checked={formData.includeRoundtrip}
              onChange={(e) => setFormData({ ...formData, includeRoundtrip: e.target.checked })}
              className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer checked:bg-blue-600 checked:border-blue-600"
            />
            <label className="text-sm font-medium cursor-pointer text-gray-900">
              Round trip (doubles the distance)
            </label>
          </div>

          {gig.isMultiDay && formData.includeRoundtrip && (
            <div 
              className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ml-4 ${
                formData.roundTripEachDay 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setFormData({ ...formData, roundTripEachDay: !formData.roundTripEachDay })}
            >
              <input
                type="checkbox"
                checked={formData.roundTripEachDay}
                onChange={(e) => setFormData({ ...formData, roundTripEachDay: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer checked:bg-blue-600 checked:border-blue-600"
              />
              <label className="text-sm font-medium cursor-pointer text-gray-900">
                Round trip each day ({(() => {
                  if (!gig.startDate || !gig.endDate) return 1;
                  const start = new Date(gig.startDate + 'T00:00:00');
                  const end = new Date(gig.endDate + 'T00:00:00');
                  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                })()} trips total)
              </label>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCalculateMileage}
          disabled={isCalculatingMileage}
          className="w-full"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {isCalculatingMileage ? "Calculating..." : "Click to Calculate Mileage"}
        </Button>

        {formData.calculatedMileage && (
          <div className="text-center p-2 bg-green-50 rounded text-sm">
            Calculated: {formData.calculatedMileage} miles
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending payment">Pending Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duties</label>
        <textarea
          className="w-full p-2 border rounded-md resize-none h-16"
          value={formData.duties}
          onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
          placeholder="Key duties and responsibilities..."
        />
      </div>

      <div className="border-t pt-3 space-y-4">
        <h4 className="font-medium text-sm">Expenses & Receipts</h4>
        
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
          <h5 className="font-medium text-blue-900 text-xs">Parking</h5>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Amount ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.parkingExpense}
                onChange={(e) => setFormData({ ...formData, parkingExpense: e.target.value })}
              />
            </div>
            <div className="flex items-center pt-4">
              <Checkbox
                id="parkingReimbursed"
                checked={formData.parkingReimbursed}
                onCheckedChange={(checked) => setFormData({ ...formData, parkingReimbursed: checked })}
              />
              <label htmlFor="parkingReimbursed" className="text-xs ml-2">
                Reimbursed
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Parking Details (optional)</label>
            <Input
              placeholder="e.g., meter parking, garage level 2"
              value={formData.parkingDescription}
              onChange={(e) => setFormData({ ...formData, parkingDescription: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
