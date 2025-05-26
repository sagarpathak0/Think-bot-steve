import os
import random
import json
import numpy as np
import torch
from RL.dqn import DQN
from RL.replay_buffer import ReplayBuffer

MEMORY_FILE = "steve_memory.json"

class SteveRLBot:
    ACTIONS = ["up", "down", "left", "right"]
    POLICY_PATH = "steve_policy_net.pth"
    TARGET_PATH = "steve_target_net.pth"

    def __init__(self, grid_size=12, state_size=4, action_size=4, device=None):
        self.grid_size = grid_size
        self.state_size = state_size
        self.action_size = action_size
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.reset()
        self.load_memory()
        # DQN
        self.policy_net = DQN(state_size, action_size).to(self.device)
        self.target_net = DQN(state_size, action_size).to(self.device)
        self.optimizer = torch.optim.Adam(self.policy_net.parameters(), lr=1e-4)  # Lower learning rate
        self.memory = ReplayBuffer(5000)  # Larger buffer
        self.batch_size = 64  # Larger batch size
        self.gamma = 0.99
        self.epsilon = 1.0
        self.epsilon_min = 0.05
        self.epsilon_decay = 0.999  # Slower decay
        self.update_target_steps = 500  # Update less frequently
        self.learn_step = 0
        self._load_dqn()
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

    def _save_dqn(self):
        torch.save(self.policy_net.state_dict(), self.POLICY_PATH)
        torch.save(self.target_net.state_dict(), self.TARGET_PATH)

    def _load_dqn(self):
        if os.path.exists(self.POLICY_PATH):
            self.policy_net.load_state_dict(torch.load(self.POLICY_PATH, map_location=self.device))
        if os.path.exists(self.TARGET_PATH):
            self.target_net.load_state_dict(torch.load(self.TARGET_PATH, map_location=self.device))

    def reset(self):
        self.x = random.randint(0, self.grid_size-1)
        self.y = random.randint(0, self.grid_size-1)
        self.known_objects = set()
        self.steps = 0

    def load_memory(self):
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.known_objects = set()
                for obs in data.get("recent_observations", []):
                    if ":" in obs:
                        _, objs = obs.split(":", 1)
                        for obj in objs.split(","):
                            self.known_objects.add(obj.strip())

    def perceive(self, env):
        obj = env.get_object(self.x, self.y)
        reward = 0.0
        done = False
        # Check for goal first (highest reward)
        if env.is_goal(self.x, self.y):
            reward = 10.0  # much larger reward for reaching goal
            done = True
        # Check for obstacle
        elif env.is_obstacle(self.x, self.y):
            reward = -5.0  # much larger penalty for hitting obstacle
            done = True
        elif obj:
            # Just record the object, no asking
            if obj not in self.known_objects:
                self.remember(obj, "")
                self.known_objects.add(obj)
                reward = 2.0  # larger reward for new object
            else:
                reward = -1.0  # larger penalty for revisiting known object
        else:
            reward = -0.1  # larger penalty for empty cell
        return obj, reward, done

    def remember(self, obj, desc):
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {"conversation_history": [], "recent_observations": []}
        data["recent_observations"].append(f"Object: {obj} = {desc}")
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def get_state(self, env):
        # State: [x, y, is_object_here, is_object_known]
        # NOTE: For better learning, consider including more info, e.g.:
        # - Relative position to nearest goal/obstacle
        # - Local grid view (3x3 around agent)
        # - One-hot encoding of position (for small grids)
        obj = env.get_object(self.x, self.y)
        is_object_here = 1.0 if obj else 0.0
        is_object_known = 1.0 if (obj in self.known_objects) else 0.0
        return np.array([self.x / (self.grid_size-1), self.y / (self.grid_size-1), is_object_here, is_object_known], dtype=np.float32)

    def choose_action(self, state):
        if np.random.rand() < self.epsilon:
            return random.randrange(self.action_size)
        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        with torch.no_grad():
            q_values = self.policy_net(state_tensor)
        return q_values.argmax().item()

    def step(self, env):
        state = self.get_state(env)
        action_idx = self.choose_action(state)
        action = self.ACTIONS[action_idx]
        # Take action
        old_x, old_y = self.x, self.y
        if action == "up" and self.y > 0:
            self.y -= 1
        elif action == "down" and self.y < self.grid_size-1:
            self.y += 1
        elif action == "left" and self.x > 0:
            self.x -= 1
        elif action == "right" and self.x < self.grid_size-1:
            self.x += 1
        self.steps += 1
        obj, reward, done = self.perceive(env)
        next_state = self.get_state(env)
        self.memory.push(state, action_idx, reward, next_state, done)
        self.learn()
        # Decay epsilon (per episode is better, but keep per step for now, just slower)
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
        return obj

    def learn(self):
        if len(self.memory) < self.batch_size:
            return
        states, actions, rewards, next_states, dones = self.memory.sample(self.batch_size)
        states = torch.FloatTensor(states).to(self.device)
        actions = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        rewards = torch.FloatTensor(rewards).unsqueeze(1).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        dones = torch.FloatTensor(dones).unsqueeze(1).to(self.device)

        q_values = self.policy_net(states).gather(1, actions)
        with torch.no_grad():
            next_q_values = self.target_net(next_states).max(1)[0].unsqueeze(1)
            target = rewards + self.gamma * next_q_values * (1 - dones)
        loss = torch.nn.functional.mse_loss(q_values, target)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        self.learn_step += 1
        if self.learn_step % self.update_target_steps == 0:
            self.target_net.load_state_dict(self.policy_net.state_dict())
            self._save_dqn()
