# disaster-ml/prediction_engine.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from geopy.distance import great_circle
import joblib

class DisasterPredictor:
    def __init__(self, model_path='models/disaster_model.pkl'):
        self.model = joblib.load(model_path)
        self.features = ['seismic_activity', 'weather_score', 
                        'population_density', 'historic_risk']
    
    def predict_risk(self, location_data):
        """Predict disaster risk score (0-1) for given coordinates"""
        processed = self._preprocess_data(location_data)
        return self.model.predict_proba(processed)[0][1]
    
    def _preprocess_data(self, data):
        """Enrich with distance from fault lines and weather patterns"""
        data['fault_distance'] = self._calculate_fault_distance(data['coordinates'])
        data['seasonal_risk'] = self._get_seasonal_factor(data['timestamp'])
        return pd.DataFrame([data])[self.features]

    def _calculate_fault_distance(self, coords):
        """Calculate distance to nearest seismic fault line"""
        nearest_fault = self._find_nearest_fault(coords)
        return great_circle(coords, nearest_fault).km
    
    def _find_nearest_fault(self, target_coords):
        """Mock fault line database query"""
        fault_lines = [(34.0522, -118.2437), (37.7749, -122.4194)]
        return min(fault_lines, key=lambda x: great_circle(target_coords, x).km)
    
    def _get_seasonal_factor(self, timestamp):
        """Calculate seasonal impact factor"""
        month = pd.to_datetime(timestamp).month
        return 0.7 if month in [6,7,8] else 0.3  # Higher risk in summer
