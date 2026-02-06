<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes with auth + throttle
Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware('role:candidate')->group(function () {
        // candidate routes (later)
    });

    Route::middleware('role:employer')->group(function () {
        // employer routes (company, jobs)
    });

    Route::middleware('role:admin')->group(function () {
        // admin panel
    });

    Route::get('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile', [AuthController::class, 'destroyProfile']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/companies/{slug}', [CompanyController::class, 'show']);

Route::middleware(['auth:api', 'role:employer'])->group(function () {
    Route::get('/employer/companies', [CompanyController::class, 'employerIndex']);
    Route::post('/employer/companies', [CompanyController::class, 'store']);
    Route::put('/employer/companies/{id}', [CompanyController::class, 'update']); // <- change here
    Route::delete('/employer/companies/{id}', [CompanyController::class, 'destroy']);
});

