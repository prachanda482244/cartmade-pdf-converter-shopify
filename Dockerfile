FROM node:18-alpine
# Install required Linux packages
RUN apk add --no-cache ghostscript graphicsmagick
EXPOSE 3000
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli
COPY . .
RUN npm run build
CMD ["npm", "run", "docker-start"]