FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN mkdir -p uploads
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]