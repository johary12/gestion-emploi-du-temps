<?php

namespace Database\Seeders;

use App\Models\Matiere;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    public function run()
    {
        $matieres = [
            ['nom' => 'Algorithmique', 'code' => 'ALGO', 'couleur' => '#2563EB'],
            ['nom' => 'Programmation Web', 'code' => 'WEB', 'couleur' => '#7C3AED'],
            ['nom' => 'Base de données', 'code' => 'BDD', 'couleur' => '#059669'],
            ['nom' => 'Réseaux', 'code' => 'RES', 'couleur' => '#D97706'],
            ['nom' => 'Systèmes d\'exploitation', 'code' => 'SE', 'couleur' => '#DC2626'],
            ['nom' => 'Génie Logiciel', 'code' => 'GL', 'couleur' => '#0891B2'],
            ['nom' => 'Intelligence Artificielle', 'code' => 'IA', 'couleur' => '#9333EA'],
            ['nom' => 'Cybersécurité', 'code' => 'SEC', 'couleur' => '#4F46E5'],
            ['nom' => 'Mathématiques', 'code' => 'MATH', 'couleur' => '#F59E0B'],
            ['nom' => 'Anglais', 'code' => 'ANG', 'couleur' => '#EC4899'],
        ];

        foreach ($matieres as $matiere) {
            Matiere::updateOrCreate(
                ['nom' => $matiere['nom']],
                $matiere
            );
        }
    }
}