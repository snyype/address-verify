'use client';

import React, { useCallback, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../lib/googleMaps';

interface MapLocation {
  lat: number;
  lng: number;
  title: string;
  address: string;
  category?: string;
}

interface GoogleMapComponentProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: MapLocation) => void;
  selectedLocation?: MapLocation;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: -25.274398,
  lng: 133.775136 // Center of Australia
};

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  locations,
  center = defaultCenter,
  zoom = 10,
  height = '400px',
  onLocationSelect,
  selectedLocation,
  className = ''
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedMarker, setSelectedMarker] = useState<MapLocation | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMarkerClick = (location: MapLocation) => {
    setSelectedMarker(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  // Auto-fit bounds when locations change
  React.useEffect(() => {
    if (mapRef.current && locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
      });
      
      if (locations.length === 1) {
        mapRef.current.setCenter(bounds.getCenter());
        mapRef.current.setZoom(15);
      } else {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [locations]);

  if (loadError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <div className="space-y-2">
          <svg className="h-12 w-12 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600">Failed to load Google Maps</p>
          <p className="text-xs text-red-500">Please check your API key and internet connection</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`} style={{ height }}>
        <div className="space-y-2">
          <div className="spinner mx-auto"></div>
          <p className="text-sm text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {locations.map((location, index) => (
          <Marker
            key={`${location.lat}-${location.lng}-${index}`}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => handleMarkerClick(location)}
            icon={{
              url: selectedLocation?.lat === location.lat && selectedLocation?.lng === location.lng
                ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMzQgMiA1IDUuMTM0IDUgOUM1IDEwLjY1NCA1LjUyNiAxMi4yNjMgNi40MzggMTMuNjI1TDEyIDIyTDE3LjU2MiAxMy42MjVDMTguNDc0IDEyLjI2MyAxOSAxMC42NTQgMTkgOUMxOSA1LjEzNCAxNS44NjYgMiAxMiAyWk0xMiAxMkMxMC4zNDMgMTIgOSAxMC42NTcgOSA5QzkgNy4zNDMgMTAuMzQzIDYgMTIgNkMxMy42NTcgNiAxNSA3LjM0MyAxNSA5QzE1IDEwLjY1NyAxMy42NTcgMTIgMTIgMTJaIiBmaWxsPSIjMzB4RkY2Ii8+Cjwvc3ZnPgo='
                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMzQgMiA1IDUuMTM0IDUgOUM1IDEwLjY1NCA1LjUyNiAxMi4yNjMgNi40MzggMTMuNjI1TDEyIDIyTDE3LjU2MiAxMy42MjVDMTguNDc0IDEyLjI2MyAxOSAxMC42NTQgMTkgOUMxOSA1LjEzNCAxNS44NjYgMiAxMiAyWk0xMiAxMkMxMC4zNDMgMTIgOSAxMC42NTcgOSA5QzkgNy4zNDMgMTAuMzQzIDYgMTIgNkMxMy42NTcgNiAxNSA3LjM0MyAxNSA5QzE1IDEwLjY1NyAxMy42NTcgMTIgMTIgMTJaIiBmaWxsPSIjRUY0NDQ0Ii8+Cjwvc3ZnPgo=',
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32)
            }}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-xs">
              <h4 className="font-semibold text-sm text-gray-900 mb-1">
                {selectedMarker.title}
              </h4>
              <p className="text-xs text-gray-600 mb-1">
                {selectedMarker.address}
              </p>
              {selectedMarker.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedMarker.category}
                </span>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
