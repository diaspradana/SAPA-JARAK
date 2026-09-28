# ==========================================
# Stage 1: Build Frontend Assets (Vite + React)
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy frontend source and build configurations
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build production bundle into dist/
RUN npm run build

# ==========================================
# Stage 2: Production PHP + Nginx Runtime
# ==========================================
FROM php:8.4-fpm-alpine

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    bash \
    git \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev

# Install PHP extensions using the official extension installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions \
    pdo_mysql \
    pdo_sqlite \
    bcmath \
    mbstring \
    zip \
    opcache \
    pcntl \
    gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Copy configuration files
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/supervisor/sapa-jarak.ini /etc/supervisor.d/sapa-jarak.ini

# Copy composer manifest and lockfile first for layer caching
COPY composer.json composer.lock ./

# Install PHP production dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy application source code
COPY . .

# Copy compiled frontend assets from Stage 1 into public/ and spa view
COPY --from=frontend-builder /app/dist/assets ./public/assets
COPY --from=frontend-builder /app/dist/index.html ./public/index.html
COPY --from=frontend-builder /app/dist/index.html ./resources/views/spa.blade.php

# Complete composer autoload & package discovery
RUN composer dump-autoload --optimize

# Setup storage, cache directories, and permissions
RUN mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache/data \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    database && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 775 storage bootstrap/cache database

# Copy and configure entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose web server port
EXPOSE 80

# Configure container health check
HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/up || exit 1

# Define entrypoint and default command
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
