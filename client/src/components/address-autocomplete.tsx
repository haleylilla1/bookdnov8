/**
 * ADDRESS AUTOCOMPLETE COMPONENT
 * Google Places autocomplete for accurate address input preventing mileage calculation failures
 * Uses session tokens to reduce API costs by 50-70%
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { MapPin, Loader2, Clock } from 'lucide-react';

// Generate a UUID for session tokens
function generateSessionToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface AddressSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

interface RecentLocation {
  address: string;
  formattedAddress?: string; // For mileage calculation
  placeId?: string;
  lat?: number;
  lng?: number;
  usedAt: number;
}

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, formattedAddress?: string, lat?: number, lng?: number) => void;
  className?: string;
  biasLat?: number;
  biasLng?: number;
  nearCity?: string;
}

// Local storage key for recent locations
const RECENT_LOCATIONS_KEY = 'bookd_recent_locations';
const MAX_RECENT_LOCATIONS = 5;

// Get recent locations from local storage
function getRecentLocations(): RecentLocation[] {
  try {
    const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (stored) {
      const locations = JSON.parse(stored) as RecentLocation[];
      // Sort by most recent and limit
      return locations
        .sort((a, b) => b.usedAt - a.usedAt)
        .slice(0, MAX_RECENT_LOCATIONS);
    }
  } catch (e) {}
  return [];
}

// Save a location to recent locations
function saveRecentLocation(location: RecentLocation): void {
  try {
    const existing = getRecentLocations();
    // Remove duplicate if exists
    const filtered = existing.filter(l => l.address.toLowerCase() !== location.address.toLowerCase());
    // Add new location at start
    const updated = [location, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export function AddressAutocomplete({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  className,
  biasLat,
  biasLng,
  nearCity
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Session token for cost optimization - groups autocomplete + place details into one billable session
  const sessionTokenRef = useRef<string>(generateSessionToken());
  
  // Reset session token after 3 minutes of inactivity or after selection
  const resetSessionToken = useCallback(() => {
    sessionTokenRef.current = generateSessionToken();
  }, []);
  
  // Load recent locations on mount
  useEffect(() => {
    setRecentLocations(getRecentLocations());
  }, []);

  // Update internal state when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fetch address suggestions with debouncing and session token
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      // Show recent locations when input is empty or short
      if (query.length === 0 && recentLocations.length > 0) {
        setShowRecent(true);
      }
      return;
    }
    
    setShowRecent(false);
    setIsLoading(true);
    
    // Reset session timeout (3 minutes of inactivity = new session)
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    sessionTimeoutRef.current = setTimeout(() => {
      resetSessionToken();
    }, 180000); // 3 minutes
    
    try {
      // Build URL with session token and optional location bias
      let url = `/api/address-autocomplete?input=${encodeURIComponent(query)}`;
      url += `&sessionToken=${sessionTokenRef.current}`;
      if (biasLat && biasLng) {
        url += `&lat=${biasLat}&lng=${biasLng}`;
      }
      if (nearCity) {
        url += `&nearCity=${encodeURIComponent(nearCity)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const newSuggestions = data.suggestions || [];
        setSuggestions(newSuggestions);
        
        const shouldShow = newSuggestions && newSuggestions.length > 0;
        setShowSuggestions(shouldShow);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for API call - reduced to 100ms for faster response
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 100);
  };

  // Handle suggestion selection - resolve place ID to formatted address
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    // Show the friendly display name immediately
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setShowRecent(false);
    setSuggestions([]);
    
    // Try to resolve the place ID to get the formatted address for mileage calculation
    // Include session token - this completes the session and groups with autocomplete for billing
    try {
      const response = await fetch(`/api/place-details?placeId=${encodeURIComponent(suggestion.placeId)}&sessionToken=${sessionTokenRef.current}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Pass display value, resolved address, and coordinates
        onChange(suggestion.description, data.formattedAddress, data.lat, data.lng);
        console.log(`[AddressAutocomplete] Resolved "${suggestion.description}" to "${data.formattedAddress}" at (${data.lat}, ${data.lng})`);
        
        // Save to recent locations for quick access next time (includes formatted address for mileage)
        saveRecentLocation({
          address: suggestion.description,
          formattedAddress: data.formattedAddress,
          placeId: suggestion.placeId,
          lat: data.lat,
          lng: data.lng,
          usedAt: Date.now()
        });
        setRecentLocations(getRecentLocations());
      } else {
        // Fallback to using the description as the address
        onChange(suggestion.description);
        // Still save to recent even without full resolution
        saveRecentLocation({
          address: suggestion.description,
          placeId: suggestion.placeId,
          usedAt: Date.now()
        });
        setRecentLocations(getRecentLocations());
      }
    } catch (error) {
      // Fallback to using the description
      onChange(suggestion.description);
    }
    
    // Reset session token after selection (session complete)
    resetSessionToken();
    
    // Focus back to input
    inputRef.current?.focus();
  };
  
  // Handle selecting a recent location
  const handleRecentSelect = (recent: RecentLocation) => {
    setInputValue(recent.address);
    setShowRecent(false);
    setShowSuggestions(false);
    
    // If we have coordinates, use them directly (no API call needed!)
    if (recent.lat && recent.lng) {
      // Use formatted address if available, otherwise fall back to display address
      const addressForMileage = recent.formattedAddress || recent.address;
      onChange(recent.address, addressForMileage, recent.lat, recent.lng);
      console.log(`[AddressAutocomplete] Used cached recent location: "${recent.address}" -> "${addressForMileage}"`);
    } else {
      onChange(recent.address);
    }
    
    // Update usage time
    saveRecentLocation({ ...recent, usedAt: Date.now() });
    setRecentLocations(getRecentLocations());
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions and recent locations to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setShowRecent(false);
    }, 200);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (inputValue.length === 0 && recentLocations.length > 0) {
      // Show recent locations when focusing on empty input
      setShowRecent(true);
    }
    // Global iOS fix handles scroll-into-view automatically
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="pr-8"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        
        {/* Map pin icon when not loading */}
        {!isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>



      {/* Recent locations dropdown */}
      {showRecent && recentLocations.length > 0 && !showSuggestions && (
        <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-xl max-h-60 overflow-y-auto"
             style={{ 
               position: 'absolute',
               top: '100%',
               left: 0,
               right: 0,
               zIndex: 99999,
               backgroundColor: 'white',
               boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
             }}>
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Recent Locations
          </div>
          {recentLocations.map((recent, index) => (
            <button
              key={`${recent.address}-${index}`}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-gray-50 hover:text-gray-900 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50 transition-colors"
              onClick={() => handleRecentSelect(recent)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex items-start">
                <Clock className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {recent.address}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-md shadow-xl max-h-60 overflow-y-auto"
             style={{ 
               position: 'absolute',
               top: '100%',
               left: 0,
               right: 0,
               zIndex: 99999,
               backgroundColor: 'white',
               border: '2px solid #3b82f6',
               boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
             }}>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 transition-colors"
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.mainText}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.secondaryText}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No suggestions message */}
      {showSuggestions && suggestions.length === 0 && inputValue.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
          <div className="text-sm text-gray-500 text-center">
            No address suggestions found
          </div>
        </div>
      )}
    </div>
  );
}