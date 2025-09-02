FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 9004
CMD ["npm", "run", "dev", "--", "--host"]
