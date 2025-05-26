import matplotlib.pyplot as plt
import numpy as np

class RLVisualizer:
    def __init__(self):
        plt.ion()
        self.fig, self.ax = plt.subplots()
        self.reward_line, = self.ax.plot([], [], label='Reward per episode')
        self.ax.set_xlabel('Episode')
        self.ax.set_ylabel('Total Reward')
        self.ax.set_title('SteveRLBot Learning Progress')
        self.ax.legend()

    def update(self, episode_rewards):
        self.reward_line.set_xdata(np.arange(len(episode_rewards)))
        self.reward_line.set_ydata(episode_rewards)
        self.ax.relim()
        self.ax.autoscale_view()
        plt.draw()
        plt.pause(0.01)

    def close(self):
        plt.ioff()
        plt.show()
