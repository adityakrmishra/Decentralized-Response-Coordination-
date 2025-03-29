import random
import logging
from enum import Enum, auto
from typing import Dict, Optional

class FailureType(Enum):
    MOTOR = auto()
    SENSOR = auto()
    COMMUNICATION = auto()
    BATTERY = auto()
    PAYLOAD = auto()

class FailureSimulator:
    """Simulate and handle drone failure scenarios"""
    
    def __init__(self, failure_probabilities: Dict[FailureType, float]):
        self.failure_probabilities = failure_probabilities
        self.active_failures = set()
        self.logger = logging.getLogger('failure_simulator')
        self.recovery_attempts = 3
        
    def check_failures(self) -> List[FailureType]:
        """Simulate random failures based on probabilities"""
        new_failures = []
        for failure_type, prob in self.failure_probabilities.items():
            if random.random() < prob and failure_type not in self.active_failures:
                self.active_failures.add(failure_type)
                new_failures.append(failure_type)
                self.logger.warning(f"Failure triggered: {failure_type.name}")
        return new_failures

    def handle_failure(self, failure_type: FailureType) -> bool:
        """Attempt to handle detected failure"""
        if failure_type not in self.active_failures:
            return False
            
        self.logger.info(f"Attempting recovery for {failure_type.name}")
        
        handlers = {
            FailureType.MOTOR: self._handle_motor_failure,
            FailureType.SENSOR: self._handle_sensor_failure,
            FailureType.COMMUNICATION: self._handle_communication_failure,
            FailureType.BATTERY: self._handle_battery_failure,
            FailureType.PAYLOAD: self._handle_payload_failure
        }
        
        success = handlers[failure_type]()
        if success:
            self.active_failures.remove(failure_type)
            self.logger.info(f"Recovered from {failure_type.name}")
            
        return success

    def _handle_motor_failure(self) -> bool:
        """Attempt motor failure recovery"""
        # Try to redistribute thrust
        return random.random() < 0.7  # 70% success rate

    def _handle_sensor_failure(self) -> bool:
        """Reset sensor subsystem"""
        return random.random() < 0.8

    def _handle_communication_failure(self) -> bool:
        """Switch to backup communication channel"""
        return random.random() < 0.9

    def _handle_battery_failure(self) -> bool:
        """Enable backup power supply"""
        return random.random() < 0.6

    def _handle_payload_failure(self) -> bool:
        """Secure payload and retry release"""
        return random.random() < 0.5

    def emergency_procedures(self, current_position: Tuple[float, float, float], 
                            home_base: Tuple[float, float, float]) -> Optional[str]:
        """Execute emergency protocols based on active failures"""
        if FailureType.BATTERY in self.active_failures:
            return "emergency_landing"
            
        if FailureType.MOTOR in self.active_failures:
            if current_position[2] > 10:
                return "controlled_descent"
            else:
                return "emergency_landing"
                
        if FailureType.COMMUNICATION in self.active_failures:
            return "return_to_home"
            
        return None

class FailureInjection:
    """Inject controlled failures for testing"""
    
    def __init__(self):
        self.injected_failures = []
        
    def inject(self, failure_type: FailureType, duration: float = 60):
        """Inject a temporary failure"""
        self.injected_failures.append({
            'type': failure_type,
            'start_time': time.time(),
            'duration': duration
        })
        
    def check_injected_failures(self):
        """Get currently active injected failures"""
        current_time = time.time()
        active = []
        for failure in self.injected_failures:
            if current_time - failure['start_time'] < failure['duration']:
                active.append(failure['type'])
        return active
