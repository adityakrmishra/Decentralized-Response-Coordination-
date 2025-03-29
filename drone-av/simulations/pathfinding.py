import heapq
import numpy as np
from typing import List, Tuple

class DronePathfinding:
    """3D pathfinding using A* algorithm with obstacle avoidance"""
    
    def __init__(self, grid_size: float = 1.0, safety_margin: float = 2.5):
        self.grid_size = grid_size
        self.safety_margin = safety_margin
        self.obstacles = set()
        
    class Node:
        def __init__(self, position: Tuple[float, float, float], cost: float = 0, parent=None):
            self.position = position
            self.cost = cost
            self.parent = parent
            
        def __lt__(self, other):
            return self.cost < other.cost

    def add_obstacle(self, position: Tuple[float, float, float], radius: float):
        """Add cylindrical obstacle to avoid"""
        x, y, z = position
        for dx in np.arange(-radius, radius + self.grid_size, self.grid_size):
            for dy in np.arange(-radius, radius + self.grid_size, self.grid_size):
                for dz in np.arange(-radius, radius + self.grid_size, self.grid_size):
                    if dx**2 + dy**2 <= radius**2:
                        self.obstacles.add((
                            round(x + dx, 2), 
                            round(y + dy, 2),
                            round(z + dz, 2)
                        )

    def heuristic(self, a: Tuple[float, float, float], b: Tuple[float, float, float]) -> float:
        """3D Euclidean distance heuristic"""
        return np.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)

    def get_neighbors(self, node: Node) -> List[Node]:
        """Generate valid neighboring nodes"""
        neighbors = []
        for dx in [-self.grid_size, 0, self.grid_size]:
            for dy in [-self.grid_size, 0, self.grid_size]:
                for dz in [-self.grid_size, 0, self.grid_size]:
                    if dx == 0 and dy == 0 and dz == 0:
                        continue
                        
                    new_pos = (
                        round(node.position[0] + dx, 2),
                        round(node.position[1] + dy, 2),
                        round(node.position[2] + dz, 2)
                    )
                    
                    if new_pos not in self.obstacles:
                        neighbors.append(self.Node(new_pos))
        return neighbors

    def find_path(self, start: Tuple[float, float, float], 
                 end: Tuple[float, float, float]) -> List[Tuple[float, float, float]]:
        """Calculate optimal path using A* algorithm"""
        open_set = []
        closed_set = set()
        
        start_node = self.Node(start, 0)
        end_node = self.Node(end)
        
        heapq.heappush(open_set, (0, start_node))
        
        while open_set:
            current_cost, current_node = heapq.heappop(open_set)
            
            if self.heuristic(current_node.position, end_node.position) < self.grid_size:
                return self._reconstruct_path(current_node)
                
            if current_node.position in closed_set:
                continue
                
            closed_set.add(current_node.position)
            
            for neighbor in self.get_neighbors(current_node):
                tentative_cost = current_node.cost + self.heuristic(current_node.position, neighbor.position)
                
                if neighbor not in [n for _, n in open_set] or tentative_cost < neighbor.cost:
                    neighbor.cost = tentative_cost
                    total_cost = tentative_cost + self.heuristic(neighbor.position, end_node.position)
                    neighbor.parent = current_node
                    
                    heapq.heappush(open_set, (total_cost, neighbor))
                    
        return []  # No path found

    def _reconstruct_path(self, node: Node) -> List[Tuple[float, float, float]]:
        path = []
        while node:
            path.append(node.position)
            node = node.parent
        return path[::-1]  # Reverse to get start->end

    def optimize_waypoints(self, path: List[Tuple[float, float, float]], 
                          max_deviation: float = 1.0) -> List[Tuple[float, float, float]]:
        """Simplify path using raycasting optimization"""
        optimized = [path[0]]
        current_index = 0
        
        while current_index < len(path) - 1:
            farthest_valid = current_index
            for i in range(current_index + 1, len(path)):
                if self._check_collision(path[current_index], path[i], max_deviation):
                    farthest_valid = i
            optimized.append(path[farthest_valid])
            current_index = farthest_valid
            
        return optimized

    def _check_collision(self, start: Tuple[float, float, float], 
                        end: Tuple[float, float, float], 
                        max_deviation: float) -> bool:
        """Raycast collision check between two points"""
        steps = int(np.linalg.norm(np.subtract(end, start)) / self.grid_size)
        for i in range(steps + 1):
            t = i / steps
            point = (
                start[0] + t*(end[0]-start[0]),
                start[1] + t*(end[1]-start[1]),
                start[2] + t*(end[2]-start[2])
            )
            rounded = (round(point[0],2), round(point[1],2), round(point[2],2))
            if rounded in self.obstacles:
                return False
        return True
