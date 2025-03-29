import { useState, useEffect } from 'react';
import { calculateDistance } from '../utils/geoUtils';

export const useGeoLocation = (options = {}) => {
  const [location, setLocation] = useState({
    coordinates: null,
    accuracy: null,
    timestamp: null,
    error: null,
    isLoading: true
  });

  const [watchId, setWatchId] = useState(null);
  const [boundary, setBoundary] = useState(null);

  const successHandler = (position) => {
    setLocation({
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      },
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      error: null,
      isLoading: false
    });
  };

  const errorHandler = (error) => {
    setLocation(prev => ({
      ...prev,
      error: {
        code: error.code,
        message: error.message,
        PERMISSION_DENIED: error.PERMISSION_DENIED,
        POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
        TIMEOUT: error.TIMEOUT
      },
      isLoading: false
    }));
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      errorHandler({ 
        code: 2,
        message: 'Geolocation not supported by browser' 
      });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: options.enableHighAccuracy || true,
        maximumAge: options.maximumAge || 0,
        timeout: options.timeout || 5000,
        ...options
      }
    );
    
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const checkBoundaryCompliance = (coordinates) => {
    if (!boundary || !coordinates) return true;
    
    const distance = calculateDistance(
      coordinates,
      boundary.center
    );
    
    return distance <= boundary.radius;
  };

  useEffect(() => {
    startTracking();
    return stopTracking;
  }, []);

  return {
    ...location,
    startTracking,
    stopTracking,
    setBoundary,
    withinBoundary: checkBoundaryCompliance(location.coordinates),
    formattedCoords: location.coordinates 
      ? `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}`
      : null
  };
};
