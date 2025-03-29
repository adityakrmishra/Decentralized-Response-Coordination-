import math
from typing import Dict, Tuple

class PayloadSimulator:
    """Simulate payload delivery operations"""
    
    def __init__(self, max_capacity: float = 5.0,  # kg
                 max_dimensions: Tuple[float, float, float] = (0.5, 0.5, 0.5)):  # meters
        self.max_capacity = max_capacity
        self.max_dimensions = max_dimensions
        self.current_payload = None
        self.center_of_gravity = (0, 0, 0)
        
    def attach_payload(self, payload: Dict[str, float]) -> bool:
        """Attempt to attach payload with safety checks"""
        if not self._validate_payload(payload):
            return False
            
        self.current_payload = payload
        self._calculate_cog()
        return True
        
    def _validate_payload(self, payload: Dict[str, float]) -> bool:
        """Check payload against drone specifications"""
        if payload['weight'] > self.max_capacity:
            return False
            
        dimensions = payload['dimensions']
        if any(d > m for d, m in zip(dimensions, self.max_dimensions)):
            return False
            
        return True
        
    def _calculate_cog(self):
        """Calculate center of gravity offset"""
        payload = self.current_payload
        if payload['cog_offset']:
            self.center_of_gravity = payload['cog_offset']
        else:
            # Assume payload is centered
            self.center_of_gravity = (
                payload['dimensions'][0]/2,
                payload['dimensions'][1]/2,
                payload['dimensions'][2]/2
            )
            
    def release_payload(self, altitude: float, velocity: float) -> bool:
        """Simulate payload release mechanics"""
        if not self.current_payload:
            return False
            
        # Check release conditions
        if altitude < 5.0:  # meters
            return False
            
        if velocity > 10.0:  # m/s
            return False
            
        # Simulate release mechanism success probability
        release_success = math.exp(-altitude/50) * (1 - velocity/15)
        return random.random() < release_success
        
    def calculate_power_consumption(self, flight_time: float, 
                                   payload_weight: float) -> float:
        """Estimate battery usage based on payload"""
        base_consumption = 100  # Watts
        payload_effect = 1 + (payload_weight / self.max_capacity)
        return base_consumption * payload_effect * flight_time
        
    def wind_effect(self, wind_speed: float, wind_direction: float) -> Tuple[float, float, float]:
    """Calculate wind impact on drone stability"""
    if not self.current_payload:
        return (0, 0, 0)
        
    payload_area = math.prod(self.current_payload['dimensions'][:2])
    drag_force = 0.5 * 1.225 * payload_area * wind_speed**2
    
    x_force = drag_force * math.cos(math.radians(wind_direction))
    y_force = drag_force * math.sin(math.radians(wind_direction))
    
    return (x_force, y_force, 0)
