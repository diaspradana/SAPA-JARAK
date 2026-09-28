FROM python:3.11-slim

WORKDIR /app

# Install system utilities (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Pre-train and export model artifact during container build
RUN python train.py

# Expose FastAPI port
EXPOSE 8001

# Configure container health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Start ASGI Uvicorn server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
