# Use a slim Python image
FROM python:3.10-slim

# Install system dependencies (incl. wkhtmltoimage)
RUN apt-get update && apt-get install -y \
    wkhtmltopdf \
    libxrender1 \
    libxext6 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy FastAPI app files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Start FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
