FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency configs
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy other source code and project configuration files
COPY . .

# Build the Next.js app
RUN pnpm build

EXPOSE 3000

# Start Next.js server
CMD ["pnpm", "start"]
