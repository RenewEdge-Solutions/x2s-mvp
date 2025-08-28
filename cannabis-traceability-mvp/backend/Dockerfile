FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install -g @nestjs/cli && npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
