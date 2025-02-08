# Use official Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose ports (if needed)
EXPOSE 3000

# Command to run worker
CMD ["node", "api/worker.js"]
