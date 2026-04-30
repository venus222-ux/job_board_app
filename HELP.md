Laravel_job_board_app\
├── backend/ # Laravel 12 API
└── frontend/ # React + Vite + TS SPA

✅ 2. Set Up Laravel Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve

php artisan jwt:secret
php artisan config:clear
php artisan config:cache

✅ 3. Set Up React Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev

✅ 4. Run in the root project:
npm run dev
docker-compose up -d
