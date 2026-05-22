<?php
// ===========================
// app/Http/Middleware/IsAdmin.php
// ===========================
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès réservé à l\'administrateur.'], 403);
        }
        return $next($request);
    }
}

// ===========================
// app/Providers/AuthServiceProvider.php
// ===========================
namespace App\Providers;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

    public function boot(): void
    {
        Gate::define('admin', fn($user) => $user->isAdmin());
    }
}

// ===========================
// Dans app/Http/Kernel.php, ajouter dans $middlewareAliases:
// 'can:admin' => \App\Http\Middleware\IsAdmin::class,
// ===========================

// ===========================
// database/seeders/DatabaseSeeder.php
// ===========================
namespace Database\Seeders;
use App\Models\User;
use App\Models\Salle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'     => 'Administrateur ENI',
            'email'    => 'admin@eni-fianarantsoa.mg',
            'password' => Hash::make('admin1234'),
            'role'     => 'admin',
        ]);

        // Profs exemples
        $profs = [
            ['name' => 'Dr. Rakoto Jean', 'email' => 'rakoto@eni-fianarantsoa.mg', 'specialite' => 'Algorithmique'],
            ['name' => 'Mme. Rasoa Marie', 'email' => 'rasoa@eni-fianarantsoa.mg', 'specialite' => 'Réseaux'],
            ['name' => 'M. Randria Paul', 'email' => 'randria@eni-fianarantsoa.mg', 'specialite' => 'Base de données'],
        ];

        foreach ($profs as $prof) {
            User::create(array_merge($prof, [
                'password' => Hash::make('prof1234'),
                'role'     => 'prof',
            ]));
        }

        // Salles
        $salles = [
            ['nom' => 'Amphi A', 'capacite' => 200, 'type' => 'amphithéâtre', 'localisation' => 'Bâtiment principal'],
            ['nom' => 'Salle 101', 'capacite' => 40, 'type' => 'salle cours', 'localisation' => 'Bâtiment A'],
            ['nom' => 'Salle 102', 'capacite' => 40, 'type' => 'salle cours', 'localisation' => 'Bâtiment A'],
            ['nom' => 'Labo Info 1', 'capacite' => 30, 'type' => 'salle TP', 'localisation' => 'Bâtiment B'],
            ['nom' => 'Labo Info 2', 'capacite' => 30, 'type' => 'salle TP', 'localisation' => 'Bâtiment B'],
        ];

        foreach ($salles as $salle) {
            Salle::create($salle);
        }
    }
}
