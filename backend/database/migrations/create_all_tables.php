<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Ajouter les colonnes manquantes à la table users existante
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'prof'])->default('prof')->after('password');
            $table->string('specialite')->nullable()->after('role');
        });

        // Table salles
        Schema::create('salles', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->integer('capacite');
            $table->string('type')->nullable();
            $table->string('localisation')->nullable();
            $table->timestamps();
        });

        // Table etudiants
        Schema::create('etudiants', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('email')->unique();
            $table->enum('niveau', ['L1', 'L2', 'L3', 'M1', 'M2']);
            $table->string('parcours');
            $table->timestamps();
        });

        // Table disponibilites
        Schema::create('disponibilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('jour', ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']);
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->timestamps();
        });

        // Table emplois_du_temps
        Schema::create('emplois_du_temps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('salle_id')->constrained()->onDelete('cascade');
            $table->string('matiere');
            $table->enum('niveau', ['L1', 'L2', 'L3', 'M1', 'M2']);
            $table->string('parcours');
            $table->enum('jour', ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']);
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->date('date_debut_semaine')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emplois_du_temps');
        Schema::dropIfExists('disponibilites');
        Schema::dropIfExists('etudiants');
        Schema::dropIfExists('salles');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'specialite']);
        });
    }
};
