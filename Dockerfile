# Kulche Wali Gali — all-in-one (frontend + /admin + /api) Node server
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies first (better layer caching)
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy the whole project (frontend assets + backend). node_modules & .env are excluded via .dockerignore
COPY . .

ENV NODE_ENV=production
EXPOSE 5000
WORKDIR /app/backend
CMD ["node", "server.js"]
