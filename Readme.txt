## 🧱 Tech Stack Overview

### Frontend

* **React** (Vite + TypeScript)
* **Zustand** — global state management
* **Axios** — API communication
* **Laravel Echo** — real-time events
* **Bootstrap** — responsive UI

### Backend

* **Laravel 12** (API-first architecture)
* **JWT Authentication** — secure stateless auth
* **Role-based Access Control** (Admin / Employer / Candidate)

### Databases & Infrastructure

* **MySQL** — core relational data
* **MongoDB** — analytics & activity logs
* **Redis** — caching & queues
* **Elasticsearch** — full-text search & filtering
* **Pusher** — real-time notifications & updates

---

## 📦 Data Architecture

### Relational Data (MySQL)

* `users`
* `companies`
* `jobs`
* `job_applications`
* `job_categories`
* `skills`
* `saved_jobs`

### Event & Analytics Data (MongoDB)

* `job_views`
* `search_logs`
* `user_activity`
* `application_events`

### Search Engine (Elasticsearch)

* `jobs` index
* Autocomplete suggestions
* Advanced filtering
* Geo-based queries *(optional / planned)*

---

## 🚀 Project Progress (Agile / Scrum)

### ✅ Sprint 1 — Authentication & Roles (Completed)

* Role-based user system
* Secure API guards
* Role-aware frontend routing
* Separate dashboards per role

---

### ✅ Sprint 2 — Company & Profile Management (Completed)

* Company CRUD operations
* Employer ↔ Company relationship
* Logo upload & storage
* Employer dashboard
* Public company profiles (slug-based)
* Automatic slug regeneration
* Logo preview & drag-and-drop upload
* Responsive company cards
* SEO-ready meta tags

---

### ✅ Sprint 3  — Job Management (Core Features)

* Job CRUD
* Draft & published jobs
* Job visibility rules
* Application flow
* Search & filtering integration

---

## ⏭️ Next Milestone

🔍 EPIC 4: Search & Filtering (🔥 big value)






## 🧠 Architecture Highlights

* Clean separation between **API** and **frontend**
* Multi-database strategy for scalability
* Event-driven design for real-time features
* Built as a **production-grade portfolio project**
