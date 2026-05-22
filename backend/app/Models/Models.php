<?php
// ===========================
// app/Models/User.php
// ===========================
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'specialite'];
    protected $hidden   = ['password', 'remember_token'];
    protected $casts    = ['password' => 'hashed'];

    public function disponibilites() { return $this->hasMany(Disponibilite::class); }
    public function emploisDuTemps() { return $this->hasMany(EmploiDuTemps::class); }
    public function isAdmin() { return $this->role === 'admin'; }
    public function isProf()  { return $this->role === 'prof';  }
}

// ===========================
// app/Models/Salle.php
// ===========================
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $fillable = ['nom', 'capacite', 'type', 'localisation'];

    public function emploisDuTemps() { return $this->hasMany(EmploiDuTemps::class); }
}

// ===========================
// app/Models/Etudiant.php
// ===========================
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    protected $fillable = ['nom', 'email', 'niveau', 'parcours'];
}

// ===========================
// app/Models/Disponibilite.php
// ===========================
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Disponibilite extends Model
{
    protected $fillable = ['user_id', 'jour', 'heure_debut', 'heure_fin'];

    public function prof() { return $this->belongsTo(User::class, 'user_id'); }
}

// ===========================
// app/Models/EmploiDuTemps.php
// ===========================
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    protected $fillable = [
        'user_id', 'salle_id', 'matiere', 'niveau',
        'parcours', 'jour', 'heure_debut', 'heure_fin', 'date_debut_semaine'
    ];

    public function prof()  { return $this->belongsTo(User::class, 'user_id'); }
    public function salle() { return $this->belongsTo(Salle::class); }
}
