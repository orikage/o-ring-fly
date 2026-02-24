# Stage 1: Build CSS
FROM oven/bun:1.2-slim AS css-builder
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY src/style.css ./src/style.css
RUN mkdir -p public && npx tailwindcss -i src/style.css -o public/style.css --minify

# Stage 2: Install production dependencies
FROM oven/bun:1.2-slim AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Stage 3: Runtime
FROM oven/bun:1.2-slim
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=css-builder /app/public ./public
COPY src/ ./src/
COPY package.json ./

ENV PORT=3001
EXPOSE 3001

CMD ["bun", "run", "src/index.tsx"]
