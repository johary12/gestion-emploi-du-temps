<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            'name'       => 'Administrateur ENI',
            'email'      => 'admin@eni-fianarantsoa.mg',
            'password'   => Hash::make('admin1234'),
            'role'       => 'admin',
            'specialite' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
