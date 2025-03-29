# analytics/report_generator.py
import pandas as pd
import matplotlib.pyplot as plt
from geojson import FeatureCollection

class ReportGenerator:
    def __init__(self, disaster_data):
        self.df = pd.DataFrame(disaster_data)
    
    def generate_heatmap(self, output_path):
        """Generate risk heatmap from historical data"""
        plt.figure(figsize=(12,8))
        plt.hexbin(self.df['lon'], self.df['lat'], 
                  C=self.df['severity'], gridsize=50, cmap='Reds')
        plt.colorbar(label='Risk Severity')
        plt.savefig(output_path)
        plt.close()
    
    def spatial_analysis(self):
        """Perform spatial clustering analysis"""
        from sklearn.cluster import DBSCAN
        coords = self.df[['lat', 'lon']].values
        clusters = DBSCAN(eps=0.3, min_samples=5).fit(coords)
        return clusters.labels_
    
    def generate_geojson(self):
        """Convert data to GeoJSON format for mapping"""
        features = []
        for _, row in self.df.iterrows():
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row['lon'], row['lat']]
                },
                "properties": dict(row)
            })
        return FeatureCollection(features)
