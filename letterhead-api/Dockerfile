FROM python:3.11-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y wget xz-utils wkhtmltopdf && \
    apt-get clean

# Set workdir
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose port and run
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
