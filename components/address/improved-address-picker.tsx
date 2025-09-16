"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Search,
  Loader2,
  Check,
  ChevronDown,
  Navigation,
  Building,
  Home,
  Landmark
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useGetLocationTreeQuery, useGetLocationsByParentQuery } from '@/store/api/locationApi';
import LocationPicker from './location-picker';

interface LocationData {
  _id: string;
  name: string;
  type: 'country' | 'province' | 'city' | 'landmark';
  parent?: string;
  shippingPrice?: number;
  children?: LocationData[];
}

interface SelectedLocation {
  country?: LocationData;
  province?: LocationData;
  city?: LocationData;
  landmark?: LocationData;
}

interface ImprovedAddressPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: SelectedLocation & {
    coordinates?: { lat: number; lng: number };
    fullAddress: string;
  }) => void;
  initialSelection?: SelectedLocation;
}

const getLocationIcon = (type: string) => {
  switch (type) {
    case 'country': return <Home className="h-4 w-4" />;
    case 'province': return <Building className="h-4 w-4" />;
    case 'city': return <Navigation className="h-4 w-4" />;
    case 'landmark': return <Landmark className="h-4 w-4" />;
    default: return <MapPin className="h-4 w-4" />;
  }
};

export default function ImprovedAddressPicker({
  isOpen,
  onClose,
  onSelect,
  initialSelection
}: ImprovedAddressPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(initialSelection || {});
  const [searchMode, setSearchMode] = useState<'browse' | 'search'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 27.7172, lng: 85.324 });
  const [isConfirming, setIsConfirming] = useState(false);
  const [openPopovers, setOpenPopovers] = useState({
    country: false,
    province: false,
    city: false,
    landmark: false
  });

  // Fetch location data
  const { data: locationTree, isLoading: isLoadingTree } = useGetLocationTreeQuery();
  const { data: provinces, isLoading: isLoadingProvinces } = useGetLocationsByParentQuery(
    selectedLocation.country?._id || '',
    { skip: !selectedLocation.country }
  );
  const { data: cities, isLoading: isLoadingCities } = useGetLocationsByParentQuery(
    selectedLocation.province?._id || '',
    { skip: !selectedLocation.province }
  );
  const { data: landmarks, isLoading: isLoadingLandmarks } = useGetLocationsByParentQuery(
    selectedLocation.city?._id || '',
    { skip: !selectedLocation.city }
  );

  // Deduplicate location data to prevent duplicate entries
  const deduplicateLocations = (locations: LocationData[] | undefined): LocationData[] => {
    if (!locations) return [];
    
    const seen = new Set<string>();
    return locations.filter(location => {
      const key = `${location.name}-${location.type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // Use deduplicated data
  const deduplicatedLocationTree = deduplicateLocations(locationTree as LocationData[]);
  const deduplicatedProvinces = deduplicateLocations(provinces);
  const deduplicatedCities = deduplicateLocations(cities);
  const deduplicatedLandmarks = deduplicateLocations(landmarks);

  // Search functionality
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // This would typically be an API call to search locations
      // For now, we'll simulate with the tree data
      const results: LocationData[] = [];
      const searchInTree = (nodes: LocationData[]) => {
        nodes.forEach(node => {
          if (node.name.toLowerCase().includes(query.toLowerCase())) {
            results.push(node);
          }
          if (node.children) {
            searchInTree(node.children);
          }
        });
      };

      if (locationTree) {
        searchInTree(locationTree as LocationData[]);
      }

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchMode === 'search') {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchMode]);

  const handleLocationSelect = (location: LocationData, type: keyof SelectedLocation) => {
    console.log('Selecting location:', location, 'for type:', type);

    const newSelection = { ...selectedLocation };

    // Clear dependent selections
    if (type === 'country') {
      newSelection.country = location;
      newSelection.province = undefined;
      newSelection.city = undefined;
      newSelection.landmark = undefined;
    } else if (type === 'province') {
      newSelection.province = location;
      newSelection.city = undefined;
      newSelection.landmark = undefined;
    } else if (type === 'city') {
      newSelection.city = location;
      newSelection.landmark = undefined;
    } else if (type === 'landmark') {
      newSelection.landmark = location;
    }

    console.log('New selection:', newSelection);
    setSelectedLocation(newSelection);

    // Close the popover
    setOpenPopovers(prev => ({ ...prev, [type]: false }));

    // Show success toast
    toast.success(`${location.name} selected as ${type}`);
  };

  const buildFullAddress = () => {
    const parts = [];
    if (selectedLocation.landmark) parts.push(selectedLocation.landmark.name);
    if (selectedLocation.city) parts.push(selectedLocation.city.name);
    if (selectedLocation.province) parts.push(selectedLocation.province.name);
    if (selectedLocation.country) parts.push(selectedLocation.country.name);
    return parts.join(', ');
  };

  const handleConfirm = async () => {
    if (isConfirming) return; // Prevent multiple clicks
    
    if (!selectedLocation.country) {
      toast.error('Please select at least a country');
      return;
    }

    try {
      setIsConfirming(true);
      
      onSelect({
        ...selectedLocation,
        coordinates,
        fullAddress: buildFullAddress()
      });
      
      onClose();
    } catch (error) {
      toast.error('Failed to confirm selection');
    } finally {
      setIsConfirming(false);
    }
  };

  const LocationSelector = ({
    type,
    label,
    data,
    isLoading,
    disabled,
    searchValue = "",
    onSearchChange
  }: {
    type: keyof SelectedLocation;
    label: string;
    data?: LocationData[];
    isLoading?: boolean;
    disabled?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
  }) => {
    const selectedValue = selectedLocation[type];
    const isOpen = openPopovers[type];
    const [internalSearchValue, setInternalSearchValue] = useState("");

    const currentSearchValue = searchValue || internalSearchValue;

    const filteredData = data?.filter(item =>
      item.name.toLowerCase().includes(currentSearchValue.toLowerCase())
    ) || [];

    const handleSearchChange = (value: string) => {
      setInternalSearchValue(value);
      if (onSearchChange) {
        onSearchChange(value);
      }
    };

    const handleSelect = (location: LocationData) => {
      console.log(`${type} selected:`, location);
      handleLocationSelect(location, type);
      setInternalSearchValue("");
      // Close the popover after selection
      setOpenPopovers(prev => ({ ...prev, [type]: false }));
    };

    return (
      <div className="space-y-1">
        {filteredData.map((location) => (
          <div
            key={location._id}
            className={cn(
              "flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm",
              selectedValue?._id === location._id && "bg-accent text-accent-foreground"
            )}
            // ✅ Prevent popover from closing immediately
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(location)}
          >
            {getLocationIcon(location.type)}
            <span className="flex-1">{location.name}</span>
            {location.type === "landmark" && location.shippingPrice && (
              <Badge variant="secondary">
                NPR {location.shippingPrice}
              </Badge>
            )}
            {selectedValue?._id === location._id && (
              <Check className="h-4 w-4" />
            )}
          </div>
        ))}
      </div>

    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Address Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={searchMode === 'browse' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('browse')}
              >
                Browse Locations
              </Button>
              <Button
                variant={searchMode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('search')}
              >
                Search
              </Button>
            </div>

            {searchMode === 'search' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {isSearching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result._id}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={() => {
                          // Auto-select based on type
                          if (result.type === 'landmark') {
                            // Need to build full hierarchy
                            toast.info('Please use browse mode for landmarks');
                          } else {
                            handleLocationSelect(result, result.type as keyof SelectedLocation);
                          }
                        }}
                      >
                        {getLocationIcon(result.type)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">{result.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Country Selection */}
                 <LocationSelector
                   type="country"
                   label="Country"
                   data={deduplicatedLocationTree}
                   isLoading={isLoadingTree}
                 />

                 {/* Province Selection */}
                 <LocationSelector
                   type="province"
                   label="Province"
                   data={deduplicatedProvinces}
                   isLoading={isLoadingProvinces}
                   disabled={!selectedLocation.country}
                 />

                 {/* City Selection */}
                 <LocationSelector
                   type="city"
                   label="City"
                   data={deduplicatedCities}
                   isLoading={isLoadingCities}
                   disabled={!selectedLocation.province}
                 />

                 {/* Landmark Selection */}
                 <LocationSelector
                   type="landmark"
                   label="Landmark"
                   data={deduplicatedLandmarks}
                   isLoading={isLoadingLandmarks}
                   disabled={!selectedLocation.city}
                 />
              </div>
            )}

            {/* Selected Address Preview */}
            {buildFullAddress() && (
              <div className="space-y-2">
                <Label>Selected Address</Label>
                <div className="p-3 bg-accent rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium">{buildFullAddress()}</div>
                      {selectedLocation.landmark?.shippingPrice && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Shipping: NPR {selectedLocation.landmark.shippingPrice}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t my-4" />

            {/* Coordinates Selection */}
            <div className="space-y-2">
              <Label>Precise Location (Optional)</Label>
              <Button
                variant="outline"
                onClick={() => setShowLocationPicker(true)}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Pick Location on Map
              </Button>
              <div className="text-xs text-muted-foreground">
                Current: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                 onClick={handleConfirm} 
                 className="flex-1"
                 disabled={isConfirming}
               >
                 {isConfirming ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Confirming...
                   </>
                 ) : (
                   'Confirm Selection'
                 )}
               </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          initialLocation={coordinates}
          onSelect={(lat, lng) => {
            setCoordinates({ lat, lng });
            setShowLocationPicker(false);
            toast.success('Location updated');
          }}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}
    </>
  );
}