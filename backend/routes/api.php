<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Reports
    Route::get('/reports', [ReportController::class, 'index']); // Get all (for teachers)
    Route::get('/reports/{id}', [ReportController::class, 'show']); // Get detail
    Route::post('/reports', [ReportController::class, 'store']); // Create
    Route::get('/students/{id}/reports', [ReportController::class, 'getByStudent']); // Get by student
    Route::put('/reports/{id}/status', [ReportController::class, 'updateStatus']); // Update status
    Route::put('/reports/{id}/notes', [ReportController::class, 'updateNotes']); // Update notes
    Route::post('/reports/{id}/messages', [ReportController::class, 'storeMessage']); // Send chat
    Route::put('/reports/{id}/messages/read', [ReportController::class, 'markMessagesRead']); // Mark chat read
});
