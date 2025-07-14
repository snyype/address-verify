import { useLoadScript } from '@react-google-maps/api';
import { env } from './env';

export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: env.googleMapsApiKey || '', 
  });

  if (loadError) {
    console.error('Error loading Google Maps:', loadError);
  }

  if (!env.googleMapsApiKey) {
    console.warn('Google Maps API key is not set. Maps functionality will be limited.');
  }

  return { isLoaded, loadError };
};
