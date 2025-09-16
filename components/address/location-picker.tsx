"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox token here
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface LocationPickerProps {
  initialLocation: {
    lat: number;
    lng: number;
  };
  onSelect: (lat: number, lng: number) => void;
  onCancel: () => void;
}

export default function LocationPicker({
  initialLocation,
  onSelect,
  onCancel,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [location, setLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);


  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 15,
    });

    map.current.on("load", () => {
      setIsMapLoaded(true);

      // Add marker at initial location
      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(map.current!);

      // Update location when marker is dragged
      marker.current.on("dragend", () => {
        const lngLat = marker.current!.getLngLat();
        setLocation({ lat: lngLat.lat, lng: lngLat.lng });
      });

      // Update marker position when map is clicked
      map.current!.on("click", (e) => {
        marker.current!.setLngLat(e.lngLat);
        setLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLocation]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !map.current) return;

    setIsSearching(true);

    try {
      // Search for location using Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?country=np&access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) {
        throw new Error("Failed to search location");
      }

      const data = await response.json();

      if (data.features.length === 0) {
        toast.warning("No results found", {
          description: "Try a different search term or drop a pin on the map",
        });
        return;
      }

      // Get the first result
      const [lng, lat] = data.features[0].center;

      // Update map and marker
      map.current.flyTo({ center: [lng, lat], zoom: 15 });
      marker.current!.setLngLat([lng, lat]);
      setLocation({ lat, lng });

      toast.success("Location found", {
        description: data.features[0].place_name,
      });
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Error", {
        description: "Failed to search location. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    onSelect(location.lat, location.lng);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pick Your Location</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Search for a location in Nepal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            variant="outline"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="relative flex-1 min-h-[300px] rounded-md overflow-hidden border">
          <div ref={mapContainer} className="absolute inset-0" />

          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-3 rounded-md text-xs">
            <p className="font-medium flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-destructive" />
              Click on the map or drag the marker to set your exact location
            </p>
            <p className="mt-1 text-muted-foreground">
              Selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Location</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
