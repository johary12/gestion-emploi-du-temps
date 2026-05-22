<?php

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
        'date_debut_semaine'
    ];

    public function prof()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
}
