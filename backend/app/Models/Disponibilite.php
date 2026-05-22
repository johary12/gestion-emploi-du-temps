<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Disponibilite extends Model
{
    protected $fillable = ['user_id', 'jour', 'heure_debut', 'heure_fin'];

    public function prof()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
