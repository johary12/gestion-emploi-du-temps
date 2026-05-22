<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        return Salle::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'          => 'required|string|max:100',
            'capacite'     => 'required|integer|min:1',
            'type'         => 'nullable|string',
            'localisation' => 'nullable|string',
        ]);
        return response()->json(Salle::create($data), 201);
    }

    public function show($id)
    {
        return Salle::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);
        $data = $request->validate([
            'nom'          => 'sometimes|string|max:100',
            'capacite'     => 'sometimes|integer|min:1',
            'type'         => 'nullable|string',
            'localisation' => 'nullable|string',
        ]);
        $salle->update($data);
        return response()->json($salle);
    }

    public function destroy($id)
    {
        Salle::findOrFail($id)->delete();
        return response()->json(['message' => 'Salle supprimée.']);
    }
}
