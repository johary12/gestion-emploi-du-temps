<?php
// ===========================
// app/Http/Controllers/AuthController.php
// ===========================
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Log de la tentative de connexion
        Log::info('Tentative de connexion', ['email' => $request->email]);
        
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            Log::warning('Échec de connexion', ['email' => $request->email]);
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Log de succès avec les infos utilisateur
        Log::info('Connexion réussie', [
            'email' => $request->email,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'specialite' => $user->specialite
        ]);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'specialite' => $user->specialite,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        Log::info('Déconnexion', ['user_id' => $user->id, 'email' => $user->email]);
        
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        Log::info('Requête me', ['user_id' => $user->id, 'email' => $user->email]);
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'specialite' => $user->specialite,
        ]);
    }

    /**
     * Changer le mot de passe de l'utilisateur connecté
     */
    public function changePassword(Request $request)
    {
        Log::info('Tentative de changement de mot de passe', ['user_id' => $request->user()->id]);
        
        $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        $user = $request->user();

        // Vérifier que le mot de passe actuel est correct
        if (!Hash::check($request->currentPassword, $user->password)) {
            Log::warning('Échec changement de mot de passe - mot de passe actuel incorrect', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            
            throw ValidationException::withMessages([
                'currentPassword' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        // Mettre à jour le mot de passe
        $user->password = Hash::make($request->newPassword);
        $user->save();

        Log::info('Changement de mot de passe réussi', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        return response()->json([
            'message' => 'Mot de passe changé avec succès',
            'success' => true
        ]);
    }
}