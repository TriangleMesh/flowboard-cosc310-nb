# Use the official Node.js image as the base image
FROM node:20-alpine

# Install OpenSSL (if needed for certificate handling)
RUN apk add --no-cache openssl ca-certificates

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Create directory for certificates (if needed)
RUN mkdir -p /app/certs

# Copy certificates from build context (will be generated in CI)
COPY certs/cert.pem certs/key.pem /app/certs/
RUN chmod 644 /app/certs/cert.pem && \
    chmod 600 /app/certs/key.pem

# Expose port 3000 (default Next.js development port)
EXPOSE 3000

# Start the Next.js development server with HTTPS
CMD ["npm", "run", "dev:https"]