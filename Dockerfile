# Base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm i --only=production

# Copy the rest of the app files
COPY . .

# Install PM2 globally
RUN npm i -g pm2

# Build the TypeScript code (if required)
RUN npm run build

# Expose the port your app is listening on
EXPOSE 5000

# Start the app using PM2
CMD ["pm2-runtime", "dist/server.js", "--name", "ecom-app", "--max", "4"]
