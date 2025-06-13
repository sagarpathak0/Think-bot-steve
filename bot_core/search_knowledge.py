"""
Semantic search over your knowledge base using Pinecone and your custom Word2Vec model.
- Embeds a user query
- Searches Pinecone for the most similar documents
- Prints the top results with their scores and file content
"""
import numpy as np
from gensim.models import Word2Vec
from pinecone import Pinecone
from dotenv import load_dotenv
import os
import re

# Load your trained Word2Vec model
model = Word2Vec.load("bot_core/knowledge/custom_word2vec.model")

# Helper to embed a query
def embed_query(query):
    tokens = [w for w in query.lower().split() if w in model.wv]
    if not tokens:
        return np.zeros(model.vector_size)
    return np.mean([model.wv[w] for w in tokens], axis=0)

# Pinecone setup
load_dotenv()
api_key = os.getenv("VECTOR_DB_API_KEY")
url = os.getenv("VECTOR_DB_URL")
m = re.match(r"https://([^.]+)\.svc\.([^.]+)\.pinecone\.io", url)
if m:
    subdomain = m.group(1)
    parts = subdomain.split('-')
    index_name = '-'.join(parts[:2])
    pc = Pinecone(api_key=api_key)
    index = pc.Index(index_name)
else:
    raise ValueError("Could not parse Pinecone index name from VECTOR_DB_URL.")

# Load filenames for mapping IDs to files
with open("bot_core/knowledge/doc_filenames.txt", encoding="utf-8") as f:
    filenames = [line.strip() for line in f]

# User query
query = input("Enter your question or search phrase: ")
query_vec = embed_query(query)

# Search Pinecone
results = index.query(vector=query_vec.tolist(), top_k=3, include_metadata=False)
print("\nTop results:")
for match in results['matches']:
    doc_id = match['id']
    score = match['score']
    print(f"\nFile: {doc_id} (score: {score:.4f})")
    # Print a snippet of the file content
    doc_path = os.path.join("bot_core/knowledge/docs", doc_id)
    if os.path.exists(doc_path):
        with open(doc_path, encoding="utf-8") as f:
            content = f.read(500)
            print(content.strip() + ("..." if len(content) == 500 else ""))
    else:
        print("[File not found]")
