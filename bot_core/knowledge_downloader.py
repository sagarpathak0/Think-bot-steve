"""
Expert Knowledgebase Downloader for AGI/Robotics/AI
- Downloads the best knowledge sources (papers, code, tutorials, docs) for a given topic list.
- Saves all files in 'knowledge/docs/'.
- Supports: arXiv, GitHub (README, docs, examples), official docs, high-quality blogs, and Wikipedia as fallback.
"""
import os
import requests
import trafilatura
import wikipediaapi

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "knowledge", "docs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# List your topics here
TOPICS = [
    "A* search algorithm",
    "Reinforcement learning",
    "Robot navigation",
    "Pathfinding",
    "Simultaneous localization and mapping",
    "Mobile robot",
    "Autonomous robot",
    "Deep Q-Network",
    "Small talk",
    "Chatbot",
    "Conversation",
    "Greeting",
    "Joke"
]

# Example mappings for key sources (expand as needed)
ARXIV_PAPERS = {
    "Reinforcement learning": ["1802.01569", "1606.01540", "1709.06560"],  # Add more survey/review papers
    "Deep Q-Network": ["1312.5602"],
    "A* search algorithm": ["2102.11279"],  # Example: survey on pathfinding
}
GITHUB_REPOS = {
    "A* search algorithm": [
        {"repo": "TheAlgorithms/Python", "files": ["README.md", "searches/a_star.py"]},
        {"repo": "aimacode/aima-python", "files": ["README.md", "aima3/search.py"]}
    ],
    "Reinforcement learning": [
        {"repo": "dennybritz/reinforcement-learning", "files": ["README.md", "DQN/dqn.py"]},
        {"repo": "openai/gym", "files": ["README.md"]}
    ],
}
TUTORIALS = {
    "A* search algorithm": [
        ("https://towardsdatascience.com/a-complete-guide-to-a-star-algorithm-5f8b5952b506", "A* Algorithm Guide"),
        ("https://www.redblobgames.com/pathfinding/a-star/introduction.html", "RedBlobGames A* Visual Guide")
    ],
    "Reinforcement learning": [
        ("https://spinningup.openai.com/en/latest/spinningup/rl_intro.html", "OpenAI RL Intro"),
        ("https://deepmind.com/learning-resources/reinforcement-learning", "DeepMind RL Resources")
    ]
}
OFFICIAL_DOCS = {
    "Reinforcement learning": [
        ("https://stable-baselines3.readthedocs.io/en/master/", "Stable Baselines3 Docs")
    ],
    "A* search algorithm": [
        ("https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.shortest_paths.astar.astar_path.html", "NetworkX A* Docs")
    ]
}

def download_arxiv(arxiv_id, title):
    import re
    url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    safe_title = re.sub(r'[^\w\-_\. ]', '_', title)
    filename = os.path.join(OUTPUT_DIR, f"arxiv_{arxiv_id}_{safe_title.replace(' ', '_')}.pdf")
    r = requests.get(url)
    if r.status_code == 200 and r.headers.get('Content-Type', '').startswith('application/pdf'):
        with open(filename, "wb") as f:
            f.write(r.content)
        print(f"[+] Saved arXiv paper: {filename}")
    else:
        print(f"[!] Failed to download arXiv paper: {arxiv_id} (status: {r.status_code}, url: {url})")

def download_github(repo, files, topic):
    import re
    safe_topic = re.sub(r'[^\w\-_\. ]', '_', topic)
    for file in files:
        url = f"https://raw.githubusercontent.com/{repo}/master/{file}"
        safe_file = file.replace('/', '_')
        filename = os.path.join(OUTPUT_DIR, f"github_{repo.replace('/', '_')}_{safe_topic.replace(' ', '_')}_{safe_file}")
        r = requests.get(url)
        if r.status_code == 200:
            with open(filename, "w", encoding="utf-8") as f:
                f.write(r.text)
            print(f"[+] Saved GitHub file: {filename}")
        else:
            print(f"[!] Failed to download GitHub file: {repo}/{file}")

def download_web(url, title):
    import re
    downloaded = trafilatura.fetch_url(url)
    if downloaded:
        text = trafilatura.extract(downloaded)
        # Sanitize title for Windows filenames
        safe_title = re.sub(r'[^\w\-_\. ]', '_', title)
        filename = os.path.join(OUTPUT_DIR, f"web_{safe_title.replace(' ', '_')}.txt")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"[+] Saved web article: {filename}")
    else:
        print(f"[!] Failed to download web article: {url}")

def download_official_docs(url, title):
    # Download the main page as text
    import re
    downloaded = trafilatura.fetch_url(url)
    if downloaded:
        text = trafilatura.extract(downloaded)
        # Sanitize title for Windows filenames
        safe_title = re.sub(r'[^\w\-_\. ]', '_', title)
        filename = os.path.join(OUTPUT_DIR, f"docs_{safe_title.replace(' ', '_')}.txt")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"[+] Saved official docs: {filename}")
    else:
        print(f"[!] Failed to download official docs: {url}")

def download_wikipedia(title):
    import re
    USER_AGENT = "ThinkBotAGI/1.0 (sagar200422@gmail.com)"
    wiki = wikipediaapi.Wikipedia(user_agent=USER_AGENT, language='en')
    page = wiki.page(title)
    if not page.exists():
        print(f"[!] Wikipedia article not found: {title}")
        return
    # Sanitize title for Windows filenames
    safe_title = re.sub(r'[^\w\-_\. ]', '_', title)
    filename = os.path.join(OUTPUT_DIR, f"wiki_{safe_title.replace(' ', '_')}.txt")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(page.text)
    print(f"[+] Saved Wikipedia article: {filename}")

def main():
    for topic in TOPICS:
        # Download arXiv papers
        for arxiv_id in ARXIV_PAPERS.get(topic, []):
            download_arxiv(arxiv_id, topic)
        # Download GitHub repos (README, docs, examples)
        for repo_info in GITHUB_REPOS.get(topic, []):
            download_github(repo_info["repo"], repo_info["files"], topic)
        # Download tutorials/blogs
        for url, title in TUTORIALS.get(topic, []):
            download_web(url, title)
        # Download official docs
        for url, title in OFFICIAL_DOCS.get(topic, []):
            download_official_docs(url, title)
        # Always fallback to Wikipedia
        download_wikipedia(topic)

if __name__ == "__main__":
    main()
