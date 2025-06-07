# Dockerfile for Render deployment (Python 3.11, with system dependencies for ML, audio, vision)
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        portaudio19-dev \
        ffmpeg \
        libsm6 \
        libxext6 \
        libgl1 \
        tesseract-ocr \
        libasound2-dev \
        build-essential \
        && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy all project files
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r bot_core/requirements.txt

# Expose the port (Render uses $PORT)
EXPOSE 10000

# Start the app (Render sets $PORT env variable)
CMD ["python", "-m", "bot_core.api_server"]
