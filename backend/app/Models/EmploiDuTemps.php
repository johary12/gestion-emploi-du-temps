<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'salle_id',
        'matiere_id',
        'matiere',
        'niveau',
        'parcours',
        'jour',
        'heure_debut',
        'heure_fin',
        'date_debut_semaine',
    ];

    protected $casts = [
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i',
    ];

    public function prof()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    public function matiereRelation()
    {
        return $this->belongsTo(Matiere::class, 'matiere_id');
    }

    public function getMatiereNomAttribute()
    {
        if ($this->matiereRelation) {
            return $this->matiereRelation->nom;
        }
        return $this->matiere;
    }

    public function getMatiereCouleurAttribute()
    {
        if ($this->matiereRelation) {
            return $this->matiereRelation->couleur;
        }
        return '#2563EB';
    }
}