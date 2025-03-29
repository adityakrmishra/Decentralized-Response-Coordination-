import React, { useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const HeatmapLayer = ({ map, data, severityField }) => {
  const { disasterData } = useBlockchain();

  useEffect(() => {
    if (!map.current || !data) return;

    // Convert emergency data to heatmap points
    const heatmapData = {
      type: 'FeatureCollection',
      features: data.map(emergency => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: emergency.epicenter
        },
        properties: {
          [severityField]: emergency.severity
        }
      }))
    };

    // Add heatmap source and layer
    if (map.current.getSource('heatmap')) {
      map.current.getSource('heatmap').setData(heatmapData);
    } else {
      map.current.addSource('heatmap', {
        type: 'geojson',
        data: heatmapData
      });

      map.current.addLayer({
        id: 'disaster-heatmap',
        type: 'heatmap',
        source: 'heatmap',
        maxzoom: 15,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', severityField],
            1, 0.2,
            5, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['exponential', 2],
            ['zoom'],
            0, 2,
            15, 25
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0.5
          ]
        }
      });
    }

    return () => {
      if (map.current.getLayer('disaster-heatmap')) {
        map.current.removeLayer('disaster-heatmap');
        map.current.removeSource('heatmap');
      }
    };
  }, [data, map, severityField, disasterData]);

  return null;
};

export default HeatmapLayer;
