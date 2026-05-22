<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\DisponibiliteController;
use App\Http\Controllers\EmploiDuTempsController;
use Illuminate\Support\Facades\Route;

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
Route::get('/emploi-du-temps/public', [EmploiDuTempsController::class, 'public']);
Route::post('/login', [AuthController::class, 'login']);

// ─── AUTHENTIFIÉ ──────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ─── PROF ─────────────────────────────────────────────────────────────────
    Route::prefix('mes-disponibilites')->group(function () {
        Route::get('/',                   [DisponibiliteController::class, 'myDispos']);
        Route::post('/',                  [DisponibiliteController::class, 'store']);
        Route::delete('/{disponibilite}', [DisponibiliteController::class, 'destroy']);
    });

    // ─── ADMIN ONLY ───────────────────────────────────────────────────────────
    Route::middleware('is_admin')->group(function () {

        Route::apiResource('profs',     ProfController::class);
        Route::apiResource('salles',    SalleController::class);
        Route::apiResource('etudiants', EtudiantController::class);

        Route::get('disponibilites/prof/{profId}', [DisponibiliteController::class, 'byProf']);

        Route::post('emploi-du-temps/envoyer-etudiants', [EmploiDuTempsController::class, 'envoyerEmail']);
        Route::post('emploi-du-temps/envoyer-profs',     [EmploiDuTempsController::class, 'envoyerEmailProfs']);

        Route::apiResource('emploi-du-temps', EmploiDuTempsController::class)
            ->except(['show']);
    });
});
