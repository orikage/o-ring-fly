# Stage 1: Install dependencies
FROM oven/bun:1.2-slim AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Stage 2: Runtime
FROM oven/bun:1.2-slim
WORKDIR /app

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY src/ ./src/
COPY public/ ./public/
COPY package.json ./

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "src/index.tsx"]
