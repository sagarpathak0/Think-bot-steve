"""
Inspect the shape of your document embeddings and (optionally) upload them to Pinecone.
"""

import numpy as np

from dotenv import load_dotenv
import os
import re

# Load embeddings
embeddings = np.load("bot_core/knowledge/doc_embeddings.npy")
print(f"Embeddings shape: {embeddings.shape}")


# Upload to Pinecone using credentials from .env
load_dotenv()
api_key = os.getenv("VECTOR_DB_API_KEY")
url = os.getenv("VECTOR_DB_URL")

if api_key and url:
    # Parse index name and environment from URL
    # Example: https://steve-agi-6lw2m2o.svc.aped-4627-b74a.pinecone.io
    m = re.match(r"https://([^.]+)\.svc\.([^.]+)\.pinecone\.io", url)
    if m:
        subdomain = m.group(1)
        environment = m.group(2)
        # The index name is the first two segments joined by a dash (e.g., steve-agi)
        parts = subdomain.split('-')
        index_name = '-'.join(parts[:2])

        from pinecone import Pinecone, ServerlessSpec
        pc = Pinecone(api_key=api_key)

        # Check if index exists, create if not
        if index_name not in [idx.name for idx in pc.list_indexes()]:
            print(f"Index '{index_name}' not found. Creating it...")
            pc.create_index(
                name=index_name,
                dimension=embeddings.shape[1],
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
            # Wait for index to be ready
            import time
            while True:
                idxs = [idx.name for idx in pc.list_indexes()]
                if index_name in idxs:
                    break
                print("Waiting for index to be ready...")
                time.sleep(2)

        index = pc.Index(index_name)

        # Load filenames
        with open("bot_core/knowledge/doc_filenames.txt", encoding="utf-8") as f:
            filenames = [line.strip() for line in f]

        # Upsert embeddings
        vectors = [(fname, vec.tolist()) for fname, vec in zip(filenames, embeddings)]
        index.upsert(vectors)
        print(f"Uploaded {len(vectors)} vectors to Pinecone index '{index_name}' in environment '{environment}'.")
    else:
        print("Could not parse Pinecone index name and environment from VECTOR_DB_URL.")
else:
    print("Pinecone credentials not found in .env. Skipping upload.")
