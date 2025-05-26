import random

class SimpleGridEnv:
    def __init__(self, grid_size=12, num_obstacles=None):
        self.grid_size = grid_size
        self.objects = {}
        self.obstacles = set()
        # Expanded object list
        object_list = [
            "apple", "ball", "tree", "dog", "cat", "car", "book", "chair", "bottle", "phone",
            "laptop", "cup", "shoe", "hat", "pen", "pencil", "bag", "mouse", "keyboard", "lamp",
            "banana", "orange", "table", "door", "window", "plant", "clock", "fan", "tv", "remote",
            "candle", "box", "bowl", "spoon", "fork", "plate", "key", "wallet", "coin", "ring"
        ]
        # Place more objects (about 2 per row)
        num_objects = grid_size * 2
        placed = 0
        while placed < num_objects:
            x, y = random.randint(0, grid_size-1), random.randint(0, grid_size-1)
            if (x, y) not in self.objects:
                self.objects[(x, y)] = random.choice(object_list)
                placed += 1

        # Place obstacles (about 10% of grid by default)
        if num_obstacles is None:
            num_obstacles = max(1, (grid_size * grid_size) // 10)
        obs_placed = 0
        while obs_placed < num_obstacles:
            x, y = random.randint(0, grid_size-1), random.randint(0, grid_size-1)
            if (x, y) not in self.objects and (x, y) not in self.obstacles:
                self.obstacles.add((x, y))
                obs_placed += 1

        # Place two goal boxes (huge reward)
        self.goals = set()
        goal_placed = 0
        while goal_placed < 2:
            x, y = random.randint(0, grid_size-1), random.randint(0, grid_size-1)
            if (x, y) not in self.objects and (x, y) not in self.obstacles and (x, y) not in self.goals:
                self.goals.add((x, y))
                goal_placed += 1

    def get_object(self, x, y):
        return self.objects.get((x, y), None)

    def is_obstacle(self, x, y):
        return (x, y) in self.obstacles

    def is_goal(self, x, y):
        return (x, y) in self.goals
