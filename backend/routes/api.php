<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\EmployerApplicationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobViewController;
use App\Http\Controllers\SearchController;

use Illuminate\Support\Facades\Route;

// -----------------------------
// Public routes
// -----------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public Companies
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/companies/{slug}', [CompanyController::class, 'show']);

// Public Jobs
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/search/jobs', [SearchController::class, 'jobs']); // full listing
Route::get('/search/jobs/autocomplete', [SearchController::class, 'autocomplete']); // autocomplete
Route::post('/jobs/{job}/view', [JobViewController::class, 'increment']);



// Public jobs – by slug or ID
Route::get('/jobs/id/{id}', [JobController::class, 'showById']);
Route::get('/jobs/{job:slug}', [JobController::class, 'show']); // candidate-friendly

// Admin dashboard
Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])
    ->middleware(['auth:api', 'role:admin']);

// Public lookup
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

// -----------------------------
// Protected routes (auth + throttle)
// -----------------------------
Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::get('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile', [AuthController::class, 'destroyProfile']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    // -----------------------------
    // Candidate routes
    // -----------------------------
    Route::middleware(['role:candidate'])->group(function () {
        Route::post('/jobs/{job}/apply', [JobController::class, 'applyToJob']); // updated to JobController
        Route::get('/jobs/{job}/view', [JobController::class, 'trackView']); // track views
        Route::delete('/applications/{id}/undo', [ApplicationController::class, 'undo']);
        Route::get('/my-applications', [ApplicationController::class, 'myApplications']);
    });

    // -----------------------------
    // Employer routes
    // -----------------------------
    Route::middleware('role:employer')->group(function () {
        // Companies
        Route::get('/employer/companies', [CompanyController::class, 'employerIndex']);
        Route::post('/employer/companies', [CompanyController::class, 'store']);
        Route::put('/employer/companies/{id}', [CompanyController::class, 'update']);
        Route::delete('/employer/companies/{id}', [CompanyController::class, 'destroy']);

        // Jobs
        Route::get('/employer/companies/{companyId}/jobs', [JobController::class, 'employerIndex']);
        Route::post('/employer/companies/{companyId}/jobs', [JobController::class, 'store']);
        Route::put('/employer/jobs/{id}', [JobController::class, 'update']);
        Route::delete('/employer/jobs/{id}', [JobController::class, 'destroy']);
        Route::patch('/employer/jobs/{id}/status', [JobController::class, 'changeStatus']);

        // Applications
        Route::get('/employer/jobs/{job}/applications', [EmployerApplicationController::class, 'index']);
        Route::patch('/applications/{id}/view', [EmployerApplicationController::class, 'markViewed']);
        Route::get('/employer/companies/{companyId}/jobs-with-applications', [EmployerApplicationController::class, 'jobsWithApplications']);
        Route::get('/employer/applications/{id}/resume', [EmployerApplicationController::class, 'downloadResume']);
    });

    // -----------------------------
    // Admin routes
    // -----------------------------
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class)->except(['index']);
        Route::apiResource('skills', SkillController::class)->except(['index']);
    });
});
