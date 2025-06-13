# Embedding Tutorial 1: Introduction to Embeddings

## What are Embeddings?
Embeddings are a way to represent words, sentences, or documents as vectors (lists of numbers) so that a computer can understand and compare their meanings. The idea is to capture the **semantic meaning** of text in a mathematical form.

- **Word Embeddings** (like Word2Vec, GloVe): Each word gets a fixed vector. Words with similar meanings have similar vectors.
- **Contextual Embeddings** (like BERT, Sentence Transformers): The same word can have different vectors depending on its context in a sentence. These are more powerful and modern.

## Why do Embeddings Matter?
- They let you compare text for similarity (e.g., find similar documents, search, clustering).
- They are the foundation for modern NLP, chatbots, and search engines.

## Classic vs. Contextual Embeddings
- **Classic (Word2Vec, GloVe):** Each word has one vector, regardless of context. Fast, but less accurate for meaning.
- **Contextual (Transformers):** Vectors depend on the sentence. Much better at understanding meaning, but require more compute.

---

## Your Task
**1. Read about Word2Vec and contextual embeddings:**
   - [Word2Vec (Wikipedia)](https://en.wikipedia.org/wiki/Word2vec)
   - [Sentence Transformers (docs)](https://www.sbert.net/)

**2. In your own words, write a short note (in a new file) answering:**
   - What is the main difference between Word2Vec and transformer-based embeddings?
   - Why might you want to use contextual embeddings for document search?

**3. When you’re done, tell me, and I’ll give you the next step!**

---

*This is your first step in building a strong foundation for modern NLP and search. Take your time, and ask me anything if you get stuck!*
