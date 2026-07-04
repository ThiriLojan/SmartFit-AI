# Use official lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system C++ libraries required by OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files and trained AI models
COPY . .

# Expose port 7860 (Hugging Face Spaces default port)
EXPOSE 7860

# Set environment variable so Flask listens on port 7860
ENV PORT=7860

# Start the Flask AI server
CMD ["python", "main.py"]
