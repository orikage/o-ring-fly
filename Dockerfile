# ─── Stage 1: Install dependencies ───────────────────────────────────
FROM oven/bun:1.2 AS deps

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# ─── Stage 2: Production image ────────────────────────────────────────
FROM oven/bun:1.2-slim AS runner

WORKDIR /app

# Copy installed node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY src/ ./src/
COPY public/ ./public/
COPY package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/ | head -c 100 || exit 1

# Run
CMD ["bun", "run", "src/index.tsx"]
