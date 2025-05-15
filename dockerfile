# 1) Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Nginx stage
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# # Stage 1: build the React app using Node
# FROM node:18-alpine AS builder
# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm ci

# # Copy source and build
# COPY . .
# RUN npm run build

# # Stage 2: serve with nginx
# FROM nginx:alpine

# # Remove default nginx content
# RUN rm -rf /usr/share/nginx/html/*

# # Copy build output
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Expose HTTP port
# EXPOSE 80

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]
