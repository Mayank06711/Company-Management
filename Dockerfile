# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
#  WORKDIR /express-app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies
RUN npm install

# If you are using bcrypt, install it separately to ensure it's built correctly
RUN npm rebuild bcrypt --build-from-source