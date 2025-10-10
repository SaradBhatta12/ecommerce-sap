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
} from "@/components/ui/popover";
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
  const [isConfirming, setIsConfirming] = useState(false);
  const [openPopovers, setOpenPopovers] = useState({
    country: false,
    province: false,
    city: false,
    landmark: false
  });

  // Fetch location data using React Query
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

  console.log('locationTree', locationTree);

  // Deduplicate location data to prevent duplicate entries
  const deduplicateLocations = (locations: LocationData[] | undefined): LocationData[] => {
    if (!locations) return [];

    const seen = new Set<string>();
    return locations.filter(location => {
      const key = `${location._id}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // Use deduplicated data
  const deduplicatedLocationTree = deduplicateLocations(locationTree as LocationData[]);
  const deduplicatedProvinces = deduplicateLocations(provinces as LocationData[]);
  const deduplicatedCities = deduplicateLocations(cities as LocationData[]);
  const deduplicatedLandmarks = deduplicateLocations(landmarks as LocationData[]);

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

      setSearchResults(results.slice(0, 10));
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

    setSelectedLocation(newSelection);
    setOpenPopovers(prev => ({ ...prev, [type]: false }));
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

  const handleConfirm = () => {
    if (isConfirming) return;

    if (!selectedLocation.country) {
      toast.error('Please select at least a country');
      return;
    }

    try {
      setIsConfirming(true);

      const fullAddress = buildFullAddress();
      onSelect({
        ...selectedLocation,
        fullAddress
      });

      toast.success('Address selected successfully');
      onClose();
    } catch (error) {
      console.error('Error confirming location:', error);
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
    disabled
  }: {
    type: keyof SelectedLocation;
    label: string;
    data?: LocationData[];
    isLoading?: boolean;
    disabled?: boolean;
  }) => {
    const selectedValue = selectedLocation[type];
    const isOpen = openPopovers[type];
    const [internalSearchValue, setInternalSearchValue] = useState("");

    const filteredData = data?.filter(item =>
      item.name.toLowerCase().includes(internalSearchValue.toLowerCase())
    ) || [];

    return (
      <div className="space-y-2">
        <Label htmlFor={`${type}-selector`}>{label}</Label>
        <Popover
          open={isOpen}
          onOpenChange={(open) => {
            if (!disabled) {
              setOpenPopovers(prev => ({ ...prev, [type]: open }));
              if (!open) {
                setInternalSearchValue("");
              }
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              id={`${type}-selector`}
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
              disabled={disabled || isLoading}
            >
              <div className="flex items-center gap-2">
                {getLocationIcon(type)}
                <span className={cn(!selectedValue && "text-muted-foreground")}>
                  {selectedValue ? selectedValue.name : `Select ${label}...`}
                </span>
              </div>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronDown className="h-4 w-4 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={internalSearchValue}
                  onChange={(e) => setInternalSearchValue(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredData.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No {label.toLowerCase()} found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredData.map((location) => (
                    <div
                      key={location._id}
                      className={cn(
                        "flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm",
                        selectedValue?._id === location._id && "bg-accent text-accent-foreground"
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleLocationSelect(location, type)}
                    >
                      {getLocationIcon(location.type)}
                      <span className="flex-1">{location.name}</span>
                      {type === "landmark" && location.shippingPrice && (
                        <Badge variant="secondary" className="ml-auto">
                          NPR {location.shippingPrice}
                        </Badge>
                      )}
                      {selectedValue?._id === location._id && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
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

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result._id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => {
                        handleLocationSelect(result, result.type as keyof SelectedLocation);
                        setSearchMode('browse');
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

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for "{searchQuery}"
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
                  <div className="flex-1">
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={isConfirming || !selectedLocation.country}
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
  );
}