<?php
// routes/api.php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\DisponibiliteController;
use App\Http\Controllers\EmploiDuTempsController;
use Illuminate\Support\Facades\Route;

// ─── Routes publiques ──────────────────────────────────────────────────────────
Route::get('/emploi-du-temps/public', [EmploiDuTempsController::class, 'public']);
Route::post('/login', [AuthController::class, 'login']);

// ─── Routes protégées ──────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    
    // ── Authentification ──
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // ── Routes Professeur (accessible à tous les utilisateurs authentifiés) ──
    Route::prefix('prof')->group(function () {
        // Récupérer l'emploi du temps du professeur connecté pour la semaine actuelle
        Route::get('/mon-emploi-du-temps', [EmploiDuTempsController::class, 'mySchedule']);
        
        // Récupérer l'emploi du temps du professeur pour une semaine spécifique
        Route::get('/mon-emploi-du-temps/semaine/{date}', 
            [EmploiDuTempsController::class, 'myScheduleByWeek']);
    });
    
    // ── Routes Professeur pour les disponibilités ──
    Route::prefix('mes-disponibilites')->group(function () {
        Route::get('/', [DisponibiliteController::class, 'myDispos']);
        Route::post('/', [DisponibiliteController::class, 'store']);
        Route::delete('/{disponibilite}', [DisponibiliteController::class, 'destroy']);
    });
    
    // ── Routes Admin (uniquement pour les administrateurs) ──
    Route::middleware('is_admin')->group(function () {
        
        // CRUD Professeurs
        Route::apiResource('profs', ProfController::class);
        
        // CRUD Salles
        Route::apiResource('salles', SalleController::class);
        
        // CRUD Étudiants
        Route::apiResource('etudiants', EtudiantController::class);
        
        // ── Emploi du temps (Admin) ──
        Route::apiResource('emploi-du-temps', EmploiDuTempsController::class);
        
        // Récupérer les cours d'une semaine spécifique
        Route::get('/emploi-du-temps/semaine/{date}', 
            [EmploiDuTempsController::class, 'getByWeek']);
        
        // Récupérer les cours d'un professeur pour une semaine
        Route::get('/emploi-du-temps/prof/{profId}/semaine/{weekStart}', 
            [EmploiDuTempsController::class, 'getByProfAndWeek']);
        
        // Récupérer les cours par niveau et parcours pour une semaine
        Route::get('/emploi-du-temps/filter', 
            [EmploiDuTempsController::class, 'filterByCriteria']);
        
        // Envoyer email aux étudiants
        Route::post('/emploi-du-temps/envoyer-etudiants', 
            [EmploiDuTempsController::class, 'envoyerEmail']);
        
        // Envoyer email aux professeurs
        Route::post('/emploi-du-temps/envoyer-profs', 
            [EmploiDuTempsController::class, 'envoyerEmailProfs']);
        
        // ── Disponibilités (Admin) ──
        Route::get('/disponibilites/prof/{profId}', 
            [DisponibiliteController::class, 'byProf']);
        
        Route::apiResource('disponibilites', DisponibiliteController::class)
            ->except(['index', 'show']);
    });
});