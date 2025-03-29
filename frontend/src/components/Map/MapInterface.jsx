import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useBlockchain } from '../../contexts/BlockchainContext';
import HeatmapLayer from './HeatmapLayer';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapInterface = ({ emergencies, supplyRoutes }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(9);
  const { currentAccount } = useBlockchain();
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: zoom,
        projection: 'globe'
      });

      map.current.on('load', () => {
        // Add emergency zones layer
        map.current.addSource('emergencies', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: emergencies.map(emergency => ({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [calculateEmergencyPolygon(
                  emergency.epicenter,
                  emergency.radius
                )]
              },
              properties: {
                id: emergency.id,
                severity: emergency.severity
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'emergency-zones',
          type: 'fill',
          source: 'emergencies',
          paint: {
            'fill-color': [
              'match',
              ['get', 'severity'],
              1, '#ffeda0',
              2, '#fed976',
              3, '#feb24c',
              4, '#fd8d3c',
              5, '#fc4e2a',
              /* default */ '#ccc'
            ],
            'fill-opacity': 0.6,
            'fill-outline-color': '#ffffff'
          }
        });

        // Add supply routes layer
        map.current.addSource('supply-routes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: supplyRoutes.map(route => ({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route.path
              },
              properties: {
                status: route.status
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'supply-routes',
          type: 'line',
          source: 'supply-routes',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'status'], 'delivered'], '#4CAF50',
              ['==', ['get', 'status'], 'in-transit'], '#2196F3',
              '#9E9E9E'
            ],
            'line-width': 4,
            'line-dasharray': [
              'match',
              ['get', 'status'],
              'delivered', [1, 0],
              'in-transit', [2, 2],
              [5, 5]
            ]
          }
        });
      });

      // Add click handler for emergency zones
      map.current.on('click', 'emergency-zones', (e) => {
        const feature = e.features[0];
        setActiveEmergency({
          id: feature.properties.id,
          coordinates: e.lngLat,
          severity: feature.properties.severity
        });
      });

      // Cleanup
      return () => map.current?.remove();
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, []);

  // Update real-time positions
  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_DRONE_WS_URL);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.account === currentAccount) {
        setRealTimeUpdates(prev => [...prev, update]);
      }
    };

    return () => ws.close();
  }, [currentAccount]);

  // Calculate emergency polygon coordinates
  const calculateEmergencyPolygon = (epicenter, radius) => {
    const points = [];
    const steps = 32;
    const lat = epicenter[0];
    const lon = epicenter[1];
    
    for (let i = 0; i < steps; i++) {
      const angle = (i * 2 * Math.PI) / steps;
      const dx = radius * Math.cos(angle);
      const dy = radius * Math.sin(angle);
      
      const newLat = lat + (180/Math.PI)*(dy/6378137);
      const newLon = lon + (180/Math.PI)*(dx/6378137)/Math.cos(lat*Math.PI/180);
      
      points.push([newLon, newLat]);
    }
    return points;
  };

  return (
    <div className="map-container" ref={mapContainer}>
      <div className="map-overlay">
        {activeEmergency && (
          <div className="emergency-tooltip" 
               style={{ left: activeEmergency.coordinates.lng, 
                        top: activeEmergency.coordinates.lat }}>
            <h3>Emergency Zone #{activeEmergency.id}</h3>
            <p>Severity Level: {activeEmergency.severity}</p>
          </div>
        )}
      </div>
      
      <HeatmapLayer 
        map={map}
        data={emergencies}
        severityField="severity"
      />
    </div>
  );
};

export default MapInterface;
