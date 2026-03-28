# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install all dependencies (including devDeps for tsc)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from previous stage
COPY --from=build /app/dist ./dist

# Create a non-root user for security (optional but recommended)
# RUN addgroup -S staycare && adduser -S staycare -G staycare
# USER staycare

EXPOSE 5000

CMD ["npm", "start"]
