FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
# install devDependencies so build tools (vite) are available at build time
RUN npm install --include=dev
COPY . .
# build the production assets at image build time
RUN npm run build

EXPOSE 9000
# run the preview server in the container
CMD ["npm", "run", "preview", "--", "--port", "9000", "--host", "0.0.0.0"]
