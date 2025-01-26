
# Use Python 3.10 as base image to satisfy Agora SDK's Python version requirements
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the server port
EXPOSE 8080

# Define the entrypoint
CMD ["python", "main.py", "server"]