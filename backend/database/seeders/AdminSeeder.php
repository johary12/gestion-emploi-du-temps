<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        // Vérifier si l'admin existe déjà
        if (!User::where('email', 'admin@eni-fianarantsoa.mg')->exists()) {
            User::create([
                'name' => 'Administrateur ENI',
                'email' => 'admin@eni-fianarantsoa.mg',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'specialite' => null,
            ]);
        } else {
            $this->command->info('Admin déjà existant, création ignorée.');
        }
    }
}