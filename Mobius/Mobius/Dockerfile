FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 7579
CMD ["node", "mobius"]
