FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --include=dev
COPY . .
RUN npm run build
EXPOSE 9001
CMD ["npm", "run", "preview", "--", "--port", "9001", "--host", "0.0.0.0"]
