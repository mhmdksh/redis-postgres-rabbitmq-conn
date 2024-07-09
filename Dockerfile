# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose port (if your app runs on a specific port)
EXPOSE 8080

CMD [ "node", "index.js" ]

