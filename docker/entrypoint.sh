#!/usr/bin/env bash
set -e

cd /var/www/html

echo "=========================================="
echo " Starting SAPA-JARAK Application Container"
echo "=========================================="

# 1. Ensure .env exists
if [ ! -f .env ]; then
    if [ -f .env.docker ]; then
        echo "Copying .env.docker to .env..."
        cp .env.docker .env
    elif [ -f .env.example ]; then
        echo "Copying .env.example to .env..."
        cp .env.example .env
    else
        echo "Creating blank .env..."
        touch .env
    fi
fi

# 2. Ensure storage and framework directories exist
mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache/data \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    database

# 3. Ensure proper permissions
chown -R www-data:www-data storage bootstrap/cache database /var/lib/nginx /var/log/nginx
chmod -R 775 storage bootstrap/cache database /var/lib/nginx

# 4. Generate Application Key if not present
if [ -z "$APP_KEY" ] && ! grep -E -q "^APP_KEY=base64:.+" .env 2>/dev/null; then
    echo "APP_KEY is not set. Generating application key..."
    php artisan key:generate --force
fi

# 5. Database Connection Handling
DB_CONN="${DB_CONNECTION:-mysql}"
echo "Configured database connection: ${DB_CONN}"

if [ "$DB_CONN" = "mysql" ]; then
    DB_H="${DB_HOST:-db}"
    DB_P="${DB_PORT:-3306}"
    DB_N="${DB_DATABASE:-sapa_jarak}"
    DB_U="${DB_USERNAME:-sapa_user}"
    DB_PW="${DB_PASSWORD:-sapa_secret}"

    echo "Waiting for MySQL database connection at ${DB_H}:${DB_P}/${DB_N}..."
    MAX_RETRIES=40
    RETRY_COUNT=0
    
    until php -r "
        \$host = '$DB_H';
        \$port = '$DB_P';
        \$db   = '$DB_N';
        \$user = '$DB_U';
        \$pass = '$DB_PW';
        try {
            \$pdo = new PDO(\"mysql:host=\$host;port=\$port;dbname=\$db\", \$user, \$pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 3
            ]);
            exit(0);
        } catch (Throwable \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            echo "ERROR: Could not connect to MySQL after $MAX_RETRIES attempts."
            echo "Please verify MySQL credentials and host status."
            exit 1
        fi
        echo "MySQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES)... retrying in 2s"
        sleep 2
    done
    echo "MySQL connection established successfully!"

elif [ "$DB_CONN" = "sqlite" ]; then
    SQLITE_PATH="${DB_DATABASE:-database/database.sqlite}"
    if [[ "$SQLITE_PATH" != /* ]]; then
        SQLITE_PATH="/var/www/html/$SQLITE_PATH"
    fi
    mkdir -p "$(dirname "$SQLITE_PATH")"
    if [ ! -f "$SQLITE_PATH" ]; then
        echo "Creating SQLite database at $SQLITE_PATH..."
        touch "$SQLITE_PATH"
    fi
    chown -R www-data:www-data "$(dirname "$SQLITE_PATH")"
    chmod 775 "$(dirname "$SQLITE_PATH")"
    chmod 664 "$SQLITE_PATH"
    echo "SQLite database ready at $SQLITE_PATH"
fi

# 6. Database Migrations
if [ "${AUTORUN_MIGRATIONS:-true}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || {
        echo "Migration attempt failed, retrying in 3 seconds..."
        sleep 3
        php artisan migrate --force
    }
fi

# 7. Database Seeding (runs automatically if hamlets table is empty)
if [ "${AUTORUN_SEED:-true}" = "true" ]; then
    NEEDS_SEED=$(php -r "
        require 'vendor/autoload.php';
        \$app = require_once 'bootstrap/app.php';
        \$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
        \$kernel->bootstrap();
        try {
            if (\App\Models\Hamlet::count() === 0) {
                echo 'yes';
            } else {
                echo 'no';
            }
        } catch (Throwable \$e) {
            echo 'yes';
        }
    " 2>/dev/null || echo "yes")

    if [ "$NEEDS_SEED" = "yes" ]; then
        echo "Database is empty. Seeding initial data (hamlets, users, sample records)..."
        php artisan db:seed --force
        echo "Seeding completed successfully!"
    else
        echo "Database already contains seed data. Skipping seeder."
    fi
fi

# 8. Storage symlink
if [ ! -L public/storage ]; then
    echo "Creating storage symlink..."
    php artisan storage:link --force || true
fi

# 9. Cache Optimization
if [ "${OPTIMIZE_LARAVEL:-false}" = "true" ]; then
    echo "Caching configuration, routes, and views for production..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
else
    echo "Clearing cached configurations for dynamic runtime..."
    php artisan config:clear || true
    php artisan route:clear || true
    php artisan view:clear || true
fi

echo "=========================================="
echo " SAPA-JARAK container initialized!"
echo " Executing: $@"
echo "=========================================="

exec "$@"
