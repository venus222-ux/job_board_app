✅ 1. Set Up Laravel Backend
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


✅ 2. Set Up React Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev


Build In:
React
TypeScript
Vite
Zustand
TanStack Query
React Hook Form

Laravel API
Redis
Elasticsearch
MySQL
MongoDB

```markdown
# JobBoard Platform 🚀

A modern, full-stack job board application built with React and Laravel, 
featuring real-time updates, advanced search capabilities, and role-based access control.

## 🏗️ High-Level Architecture

### Frontend Stack
```
React 18 (Vite + TypeScript)
├── Zustand (State Management)
├── Axios (HTTP Client)
└── Laravel Echo (Real-time Updates)
```

### Backend Stack
```
Laravel 12 API
├── MySQL (Users, Jobs, Applications)
├── MongoDB (Logs, Views, Activity)
├── Redis (Cache & Queues - Email notifications)
├── Elasticsearch (Search Engine)
├── Pusher (Real-time Events)
└── JWT Authentication
```

## 📊 Data Architecture

### Relational Data (MySQL)
- `users` - User accounts and authentication
- `companies` - Company profiles and information
- `jobs` - Job listings and details
- `job_applications` - Candidate applications
- `job_categories` - Job categorization
- `skills` - Skills management
- `saved_jobs` - User saved/bookmarked jobs

### Event & Analytics Data (MongoDB)
- `job_views` - Track job listing views
- `search_logs` - User search behavior analytics
- `user_activity` - Platform engagement tracking
- `application_events` - Application lifecycle events

### Search Engine (Elasticsearch)
- `jobs` index with full-text search
- Autocomplete suggestions
- Advanced filtering
- Geo-based queries *(optional / planned)*

## 👥 User Stories

### Guest User
- As a user, I can search and filter jobs
- View job details and company information

### Candidate
- As a candidate, I can apply to a job (only once)
- I must be logged in to apply
- Upload my resume (PDF format)
- I can undo my application within 3 seconds
- View my application history in dashboard
- Receive email notification when employer views my application

### Employer
- As an employer, I can view applications for my jobs
- Mark an application as viewed
- Add and manage job listings
- Add and manage company profile

### Admin
- As an admin, I can CRUD job categories
- I can CRUD skills

## 🚀 Project Progress (Agile / Scrum)

### ✅ Sprint 1 — Authentication & Roles (Completed)
- Role-based user system
- Secure API guards
- Role-aware frontend routing
- Separate dashboards per role

### ✅ Sprint 2 — Company & Profile Management (Completed)
- Company CRUD operations
- Employer ↔ Company relationship
- Logo upload & storage
- Employer dashboard
- Public company profiles (slug-based)
- Automatic slug regeneration
- Logo preview & drag-and-drop upload
- Responsive company cards
- SEO-ready meta tags

### ✅ Sprint 3 — Job Management (Completed)
- Job CRUD operations
- Draft & published job states
- Job visibility rules
- Application flow
- Search & filtering integration

### ✅ Sprint 4 — Search & Filtering (Completed)
- Elasticsearch integration
- Full-text search capabilities
- Filters: Location, Salary range, Job type, Skills
- Sorting by date and relevance
- Search bar with debounce
- Filter sidebar
- Autocomplete suggestions

## ⏭️ Next Milestone

### 📄 Sprint 5 — Applications & Resume Management (Upcoming)
- Resume upload and parsing
- Application tracking system
- Email notification queue implementation
- View tracking for employer applications
- Enhanced candidate dashboard
```
