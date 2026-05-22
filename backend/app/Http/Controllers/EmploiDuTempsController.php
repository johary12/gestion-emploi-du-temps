<?php

namespace App\Http\Controllers;

use App\Models\EmploiDuTemps;
use App\Models\Etudiant;
use App\Mail\EmploiDuTempsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmploiDuTempsController extends Controller
{
    public function public(Request $request)
    {
        $query = EmploiDuTemps::with(['prof', 'salle']);
        if ($request->filled('niveau'))   $query->where('niveau',   $request->niveau);
        if ($request->filled('parcours')) $query->where('parcours', $request->parcours);

        return $query->get()->map(fn($e) => [
            'id'          => $e->id,
            'matiere'     => $e->matiere,
            'niveau'      => $e->niveau,
            'parcours'    => $e->parcours,
            'jour'        => $e->jour,
            'heure_debut' => $e->heure_debut,
            'heure_fin'   => $e->heure_fin,
            'prof'        => $e->prof?->name,
            'salle'       => $e->salle?->nom,
        ]);
    }

    public function index()
    {
        return EmploiDuTemps::with(['prof', 'salle'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'            => 'required|exists:users,id',
            'salle_id'           => 'required|exists:salles,id',
            'matiere'            => 'required|string|max:200',
            'niveau'             => 'required|in:L1,L2,L3,M1,M2',
            'parcours'           => 'required|string|max:100',
            'jour'               => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut'        => 'required|date_format:H:i',
            'heure_fin'          => 'required|date_format:H:i|after:heure_debut',
            'date_debut_semaine' => 'nullable|date',
        ]);
        $edt = EmploiDuTemps::create($data);
        return response()->json($edt->load(['prof', 'salle']), 201);
    }

    public function update(Request $request, $id)
    {
        $edt = EmploiDuTemps::findOrFail($id);
        $data = $request->validate([
            'user_id'            => 'sometimes|exists:users,id',
            'salle_id'           => 'sometimes|exists:salles,id',
            'matiere'            => 'sometimes|string|max:200',
            'niveau'             => 'sometimes|in:L1,L2,L3,M1,M2',
            'parcours'           => 'sometimes|string|max:100',
            'jour'               => 'sometimes|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut'        => 'sometimes|date_format:H:i',
            'heure_fin'          => 'sometimes|date_format:H:i',
            'date_debut_semaine' => 'nullable|date',
        ]);
        $edt->update($data);
        return response()->json($edt->load(['prof', 'salle']));
    }

    public function destroy($id)
    {
        EmploiDuTemps::findOrFail($id)->delete();
        return response()->json(['message' => 'Cours supprimé.']);
    }

    public function envoyerEmail(Request $request)
    {
        $request->validate([
            'niveau'   => 'required',
            'parcours' => 'required',
        ]);

        $etudiants = Etudiant::where('niveau',   $request->niveau)
            ->where('parcours', $request->parcours)
            ->get();

        if ($etudiants->isEmpty()) {
            return response()->json(['message' => 'Aucun étudiant trouvé.'], 404);
        }

        $emplois = EmploiDuTemps::with(['prof', 'salle'])
            ->where('niveau',   $request->niveau)
            ->where('parcours', $request->parcours)
            ->get();

        foreach ($etudiants as $etudiant) {
            Mail::to($etudiant->email)->send(new EmploiDuTempsMail($etudiant, $emplois));
        }

        return response()->json(['message' => "Email envoyé à {$etudiants->count()} étudiant(s)."]);
    }

    public function envoyerEmailProfs()
    {
        $emplois = EmploiDuTemps::with(['prof', 'salle'])->get();
        $profIds = $emplois->pluck('user_id')->unique();
        $profs   = \App\Models\User::whereIn('id', $profIds)->get();

        foreach ($profs as $prof) {
            $emploisProf = $emplois->where('user_id', $prof->id)->values();
            Mail::to($prof->email)->send(new EmploiDuTempsMail($prof, $emploisProf, true));
        }

        return response()->json(['message' => "Email envoyé à {$profs->count()} professeur(s)."]);
    }
}
