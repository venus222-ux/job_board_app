FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    supervisor

# Install standard PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# --- INSTALL REDIS EXTENSION ---
# This is the part that fixes your "Class Redis not found" error
RUN pecl install redis && docker-php-ext-enable redis

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy the supervisor config
COPY ./docker/supervisord.conf /etc/supervisor/supervisord.conf

# Start Supervisor
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
