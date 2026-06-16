<?php
// app/Models/EmploiDuTemps.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    protected $table = 'emplois_du_temps';

    protected $fillable = [
        'user_id',
        'salle_id',
        'matiere',
        'niveau',
        'parcours',
        'jour',
        'heure_debut',
        'heure_fin',
        'date_debut_semaine',
    ];

    protected $casts = [
        'date_debut_semaine' => 'date',
        'heure_debut' => 'string',
        'heure_fin' => 'string',
    ];

    public function prof()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    // Scope pour filtrer par semaine
    public function scopeForWeek($query, $weekStart)
    {
        return $query->where('date_debut_semaine', $weekStart);
    }

    // Scope pour filtrer par niveau
    public function scopeForNiveau($query, $niveau)
    {
        return $query->where('niveau', $niveau);
    }

    // Scope pour filtrer par parcours
    public function scopeForParcours($query, $parcours)
    {
        return $query->where('parcours', $parcours);
    }
}