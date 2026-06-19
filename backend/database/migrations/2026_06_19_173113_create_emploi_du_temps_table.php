<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('emploi_du_temps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('salle_id')->constrained('salles')->onDelete('cascade');
            $table->foreignId('matiere_id')->nullable()->constrained('matieres')->onDelete('set null');
            $table->string('matiere', 200);
            $table->enum('niveau', ['L1', 'L2', 'L3', 'M1', 'M2']);
            $table->string('parcours', 100);
            $table->enum('jour', ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']);
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->date('date_debut_semaine')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('emploi_du_temps');
    }
};