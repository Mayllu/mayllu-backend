FROM node:22

# Create app directory
WORKDIR /backend

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000