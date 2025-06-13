"""
Train a custom 300-dimensional embedding model on your knowledge base documents.
- Loads all .txt files from bot_core/knowledge/docs/
- Trains a Word2Vec model (gensim) with 300 dimensions
- Saves the model and outputs a 300-dim embedding for each document (by averaging word vectors)
"""
import os
import glob
import numpy as np
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess

DOCS_DIR = os.path.join(os.path.dirname(__file__), "knowledge", "docs")
EMBED_DIM = 300
MODEL_PATH = os.path.join(os.path.dirname(__file__), "knowledge", "custom_word2vec.model")
EMBEDDINGS_PATH = os.path.join(os.path.dirname(__file__), "knowledge", "doc_embeddings.npy")
FILENAMES_PATH = os.path.join(os.path.dirname(__file__), "knowledge", "doc_filenames.txt")

# 1. Load and preprocess documents
documents = []
filenames = []
for path in glob.glob(os.path.join(DOCS_DIR, "*.txt")):
    with open(path, encoding="utf-8") as f:
        text = f.read()
        tokens = simple_preprocess(text)
        if tokens:
            documents.append(tokens)
            filenames.append(os.path.basename(path))

# 2. Train Word2Vec model
print(f"Training Word2Vec on {len(documents)} documents...")
model = Word2Vec(sentences=documents, vector_size=EMBED_DIM, window=8, min_count=2, workers=4, sg=1)
model.save(MODEL_PATH)
print(f"Model saved to {MODEL_PATH}")

# 3. Compute document embeddings (average word vectors)
doc_embeddings = []
for tokens in documents:
    vectors = [model.wv[word] for word in tokens if word in model.wv]
    if vectors:
        doc_vec = np.mean(vectors, axis=0)
    else:
        doc_vec = np.zeros(EMBED_DIM)
    doc_embeddings.append(doc_vec)
doc_embeddings = np.stack(doc_embeddings)
np.save(EMBEDDINGS_PATH, doc_embeddings)
with open(FILENAMES_PATH, "w", encoding="utf-8") as f:
    for fname in filenames:
        f.write(fname + "\n")
print(f"Saved {len(doc_embeddings)} document embeddings to {EMBEDDINGS_PATH}")
