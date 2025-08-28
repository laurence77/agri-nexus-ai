FROM node:20-alpine
WORKDIR /app

# Copy root package.json to install shared deps (express, cors, formidable, supabase)
COPY package*.json ./
RUN npm install --omit=dev --no-fund --no-audit \
 && npm cache clean --force

# Copy only the server code
COPY server ./server

EXPOSE 3001
CMD ["node", "server/index.js"]

