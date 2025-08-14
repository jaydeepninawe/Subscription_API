# Use lightweight Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without dev packages
RUN npm install --omit=dev

# Copy the rest of the project
COPY . .

# Expose the app port (change if needed)
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
