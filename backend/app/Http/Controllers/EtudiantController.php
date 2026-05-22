<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    public function index(Request $request)
    {
        $query = Etudiant::query();
        if ($request->filled('niveau'))   $query->where('niveau',   $request->niveau);
        if ($request->filled('parcours')) $query->where('parcours', $request->parcours);
        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'      => 'required|string|max:255',
            'email'    => 'required|email|unique:etudiants',
            'niveau'   => 'required|in:L1,L2,L3,M1,M2',
            'parcours' => 'required|string|max:100',
        ]);
        return response()->json(Etudiant::create($data), 201);
    }

    public function show($id)
    {
        return Etudiant::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $etudiant = Etudiant::findOrFail($id);
        $data = $request->validate([
            'nom'      => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:etudiants,email,' . $id,
            'niveau'   => 'sometimes|in:L1,L2,L3,M1,M2',
            'parcours' => 'sometimes|string|max:100',
        ]);
        $etudiant->update($data);
        return response()->json($etudiant);
    }

    public function destroy($id)
    {
        Etudiant::findOrFail($id)->delete();
        return response()->json(['message' => 'Étudiant supprimé.']);
    }
}
