"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_LOCATIONS } from "@/lib/graphqlmutation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, Loader2, Filter } from "lucide-react";
import GoogleMapComponent from "./GoogleMap";
import {
  saveSourceData,
  getSourceData,
  useActivityLogger,
} from "@/lib/elasticsearch";

interface Location {
  id: string;
  name: string;
  postcode: string;
  state: string;
  latitude: number;
  longitude: number;
  category?: string;
}

const LOCATION_CATEGORIES = ["Delivery Area", "Post Office Boxes"];

const Source: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [searchLocations, { loading, error }] = useLazyQuery(SEARCH_LOCATIONS);
  const { logSearch } = useActivityLogger();

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
    // Load persisted data
    const savedData = getSourceData();
    if (savedData) {
      setQuery(savedData.query || "");
      setSelectedCategories(savedData.categories || []);
      setLocations(savedData.results || []);
      if (savedData.selectedLocation) {
        setSelectedLocation(savedData.selectedLocation);
      }
    }
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    if (isClient) {
      saveSourceData({
        query,
        categories: selectedCategories,
        results: locations,
        selectedLocation,
      });
    }
  }, [query, selectedCategories, locations, selectedLocation, isClient]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await searchLocations({
        variables: {
          query: query.trim(),
          categories:
            selectedCategories.length > 0 ? selectedCategories : undefined,
        },
      });

      const searchResults = response.data?.searchLocations || [];

      // Transform API response to our Location interface using real coordinates from API
      const transformedResults: Location[] = searchResults.map(
        (item: any, index: number) => ({
          id: `${item.postcode}-${item.location}-${index}`,
          name: item.location,
          postcode: item.postcode,
          state: item.state,
          latitude: item.latitude || -33.8688 + (Math.random() - 0.5) * 2, // Use API coordinates or fallback
          longitude: item.longitude || 151.2093 + (Math.random() - 0.5) * 2,
          category: item.category || "Delivery Area",
        })
      );

      setLocations(transformedResults);
      setSelectedLocation(null);

      // Log the search activity
      await logSearch(
        { query, categories: selectedCategories },
        transformedResults,
        true
      );
    } catch (err) {
      console.error("Search failed:", err);
      setLocations([]);

      // Log the failed search
      await logSearch(
        { query, categories: selectedCategories },
        { error: err instanceof Error ? err.message : "Unknown error" },
        false
      );
    }
  };

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);

    // Log the location selection
    await logSearch({ query, selectedLocation: location.id }, location, true);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredLocations = locations.filter(
    (location) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(location.category || "Delivery Area")
  );

  const mapLocations = filteredLocations.map((loc) => ({
    lat: loc.latitude,
    lng: loc.longitude,
    title: loc.name,
    address: `${loc.name}, ${loc.state} ${loc.postcode}`,
    category: loc.category,
  }));

  if (!isClient) {
    return (
      <div className="py-8 px-4">
        <div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Location Search
            </h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Search Locations</CardTitle>
                <CardDescription>
                  Enter a suburb name or postcode to find locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm font-medium">
                    Suburb or Postcode
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., Melbourne or 3000"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={loading || !query.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Filter by Category
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Filters
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                      {LOCATION_CATEGORIES.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() =>
                              handleCategoryToggle(category)
                            }
                          />
                          <Label htmlFor={category} className="text-xs">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      Failed to search locations. Please try again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            {filteredLocations.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Search Results</CardTitle>
                  <CardDescription>
                    Found {filteredLocations.length} location
                    {filteredLocations.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                    {filteredLocations.map((location) => (
                      <div
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedLocation?.id === location.id
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {location.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {location.state} {location.postcode}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {location.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {query && filteredLocations.length === 0 && !loading && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No locations found for "{query}"
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try a different suburb or postcode
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Location Map</CardTitle>
              <CardDescription>
                {selectedLocation
                  ? `Showing: ${selectedLocation.name}`
                  : filteredLocations.length > 0
                  ? `Showing ${filteredLocations.length} locations`
                  : "Search for locations to see them on the map"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mapLocations.length > 0 ? (
                <GoogleMapComponent
                  locations={mapLocations}
                  zoom={selectedLocation ? 15 : 10}
                  height="500px"
                  onLocationSelect={(mapLocation) => {
                    const location = filteredLocations.find(
                      (loc) =>
                        loc.latitude === mapLocation.lat &&
                        loc.longitude === mapLocation.lng
                    );
                    if (location) {
                      handleLocationSelect(location);
                    }
                  }}
                  selectedLocation={
                    selectedLocation
                      ? {
                          lat: selectedLocation.latitude,
                          lng: selectedLocation.longitude,
                          title: selectedLocation.name,
                          address: `${selectedLocation.name}, ${selectedLocation.state} ${selectedLocation.postcode}`,
                        }
                      : undefined
                  }
                  className="rounded-lg"
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Search for locations to see them on the map
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Source;
