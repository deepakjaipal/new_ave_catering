# Use Node.js 18 Alpine image
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=10000

# Start the application
CMD ["pnpm", "start"]
