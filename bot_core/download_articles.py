"""
Script to download and save high-quality AGI/robotics/AI knowledge sources.
Saves PDFs, code, and web articles in 'knowledge/docs/'.
"""
import os
import requests

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "knowledge", "docs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Example sources: arXiv papers, GitHub repos, and web articles
SOURCES = [
    # arXiv papers (PDFs)
    {"type": "arxiv", "id": "1802.01569", "title": "A Modern Introduction to RL"},
    {"type": "arxiv", "id": "1606.01540", "title": "Asynchronous Methods for Deep RL"},
    # GitHub code (README or main file)
    {"type": "github", "repo": "openai/gym", "file": "README.md"},
    # Web articles/tutorials
    {"type": "web", "url": "https://towardsdatascience.com/a-complete-guide-to-a-star-algorithm-5f8b5952b506", "title": "A* Algorithm Guide"},
]

def download_arxiv(arxiv_id, title):
    url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    filename = os.path.join(OUTPUT_DIR, f"{title.replace(' ', '_')}.pdf")
    r = requests.get(url)
    if r.status_code == 200:
        with open(filename, "wb") as f:
            f.write(r.content)
        print(f"[+] Saved arXiv paper: {filename}")
    else:
        print(f"[!] Failed to download arXiv paper: {arxiv_id}")

def download_github(repo, file):
    url = f"https://raw.githubusercontent.com/{repo}/master/{file}"
    filename = os.path.join(OUTPUT_DIR, f"{repo.replace('/', '_')}_{file.replace('/', '_')}")
    r = requests.get(url)
    if r.status_code == 200:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(r.text)
        print(f"[+] Saved GitHub file: {filename}")
    else:
        print(f"[!] Failed to download GitHub file: {repo}/{file}")

def download_web(url, title):
    try:
        import trafilatura
    except ImportError:
        print("[!] Please install trafilatura: pip install trafilatura")
        return
    downloaded = trafilatura.fetch_url(url)
    if downloaded:
        text = trafilatura.extract(downloaded)
        filename = os.path.join(OUTPUT_DIR, f"{title.replace(' ', '_')}.txt")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"[+] Saved web article: {filename}")
    else:
        print(f"[!] Failed to download web article: {url}")

if __name__ == "__main__":
    for src in SOURCES:
        if src["type"] == "arxiv":
            download_arxiv(src["id"], src["title"])
        elif src["type"] == "github":
            download_github(src["repo"], src["file"])
        elif src["type"] == "web":
            download_web(src["url"], src["title"])
