FROM node:20-alpine

# Install pnpm globally matching project version
RUN npm install -g pnpm@10.33.0

WORKDIR /app

# Copy dependency configs
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src ./src

# Build the TypeScript project
RUN pnpm build

EXPOSE 4000

# Start server from compiled directory
CMD ["pnpm", "start"]
