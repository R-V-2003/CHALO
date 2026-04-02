# Build Stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:20-slim AS production
# Install SQLite runtime dependencies (better-sqlite3 needs these)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --omit=dev
# Copy built frontend
COPY --from=build /app/dist ./dist
# Copy server files
COPY server/ ./server/
# Create directory for SQLite data
RUN mkdir -p data

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server/index.js"]
