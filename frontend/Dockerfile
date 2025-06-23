FROM node:18-alpine as development

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (this layer will be cached)
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]

# Production build
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies for build (faster with --prefer-offline)
RUN npm ci --prefer-offline --no-audit --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine as production

COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
