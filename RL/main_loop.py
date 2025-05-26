import pygame
from RL.env import SimpleGridEnv
from RL.agent import SteveRLBot
from RL.visualization import RLVisualizer

def run_rl_sim():
    pygame.init()
    size = 600
    grid_size = 12
    cell = size // grid_size
    screen = pygame.display.set_mode((size, size))
    pygame.display.set_caption("Steve RL Bot Grid World")
    clock = pygame.time.Clock()
    env = SimpleGridEnv(grid_size)
    steve = SteveRLBot(grid_size)

    episode_rewards = []
    episode = 0
    max_episodes = 100  # You can increase for longer training
    steps_per_episode = 100

    visualizer = RLVisualizer()

    try:
        while episode < max_episodes:
            env = SimpleGridEnv(grid_size)
            steve.reset()
            total_reward = 0
            running = True
            step_count = 0
            while running and step_count < steps_per_episode:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                        episode = max_episodes  # Exit all
                screen.fill((255,255,255))
                # Draw obstacles
                for (x, y) in env.obstacles:
                    pygame.draw.rect(screen, (0,0,0), (x*cell, y*cell, cell, cell))
                # Draw goals
                for (x, y) in env.goals:
                    pygame.draw.rect(screen, (0,255,0), (x*cell, y*cell, cell, cell))
                # Draw objects
                for (x, y), obj in env.objects.items():
                    pygame.draw.rect(screen, (200,200,200), (x*cell, y*cell, cell, cell))
                    font = pygame.font.SysFont(None, 18)
                    img = font.render(obj, True, (0,0,0))
                    screen.blit(img, (x*cell+2, y*cell+2))
                # Draw Steve
                pygame.draw.circle(screen, (0,0,255), (steve.x*cell+cell//2, steve.y*cell+cell//2), cell//3)
                pygame.display.flip()
                # Steve acts
                obj, reward, _ = steve.step(env), 0, False
                _, reward, _ = steve.perceive(env)
                total_reward += reward
                step_count += 1
                clock.tick(20)
            episode_rewards.append(total_reward)
            visualizer.update(episode_rewards)
            steve._save_dqn()
            episode += 1
    except KeyboardInterrupt:
        print("\n[INFO] Training interrupted. Saving Steve's DQN weights...")
        steve._save_dqn()
        print("[INFO] DQN weights saved. Exiting safely.")
    finally:
        visualizer.close()
        pygame.quit()

if __name__ == "__main__":
    run_rl_sim()
