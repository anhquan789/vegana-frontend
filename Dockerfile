## Multi-stage Dockerfile for building and running Next.js production
## - Build stage installs deps and runs `next build`
## - Runner stage runs the optimized build with `next start`

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on lockfile
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci --silent

# Copy source
COPY . .

# Build the application
RUN npm run build

### Runner image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose default Next.js port
EXPOSE 3000

# Use a non-root user for better security (optional)
RUN addgroup -S next && adduser -S next -G next || true
USER next

# Start the Next.js server
CMD ["npm", "run", "start"]
