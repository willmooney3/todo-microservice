# Use an official Node.js runtime as the parent image
FROM node:21

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application’s dependencies
RUN npm install

# Bundle the application’s source code inside the Docker image
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose a port that the application will be reachable at
EXPOSE 3000

# Define the command to run the application
CMD ["node", "dist/index.js"]
