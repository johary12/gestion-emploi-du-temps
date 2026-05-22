<?php

namespace App\Http\Controllers;

use App\Models\Disponibilite;
use Illuminate\Http\Request;

class DisponibiliteController extends Controller
{
    public function myDispos(Request $request)
    {
        return Disponibilite::where('user_id', $request->user()->id)->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'jour'        => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin'   => 'required|date_format:H:i|after:heure_debut',
        ]);
        $data['user_id'] = $request->user()->id;
        return response()->json(Disponibilite::create($data), 201);
    }

    public function destroy(Request $request, $id)
    {
        $dispo = Disponibilite::findOrFail($id);
        if ($dispo->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }
        $dispo->delete();
        return response()->json(['message' => 'Disponibilité supprimée.']);
    }

    public function byProf($profId)
    {
        return Disponibilite::where('user_id', $profId)->get();
    }
}
