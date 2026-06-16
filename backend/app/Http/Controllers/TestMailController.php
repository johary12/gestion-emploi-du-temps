<?php
// app/Http/Controllers/TestMailController.php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;

class TestMailController extends Controller
{
    public function testEmail()
    {
        try {
            $testEtudiant = Etudiant::first();
            if (!$testEtudiant) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Aucun étudiant trouvé pour le test'
                ], 404);
            }
            
            Mail::raw('Test d\'envoi d\'email depuis ENI Fianarantsoa', function($message) use ($testEtudiant) {
                $message->to($testEtudiant->email)
                        ->subject('Test Email - ENI Fianarantsoa');
            });
            
            return response()->json([
                'success' => true, 
                'message' => 'Email test envoyé à ' . $testEtudiant->email
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }
}