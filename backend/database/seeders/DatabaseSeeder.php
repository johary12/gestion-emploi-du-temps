<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Vérifier si l'admin existe déjà
        $adminExists = \App\Models\User::where('email', 'admin@eni-fianarantsoa.mg')->exists();

        if (!$adminExists) {
            $this->call([
                AdminSeeder::class,
                MatiereSeeder::class,
                // Ajoutez d'autres seeders ici
            ]);
        } else {
            $this->command->info('⚠️ Admin existe déjà, exécution des autres seeders...');
            $this->call([
                MatiereSeeder::class,
                // Ajoutez d'autres seeders ici
            ]);
        }
    }
}