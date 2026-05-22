<?php
// ===========================
// app/Http/Controllers/DisponibiliteController.php
// ===========================
namespace App\Http\Controllers;
use App\Models\Disponibilite;
use Illuminate\Http\Request;

class DisponibiliteController extends Controller
{
    // Prof: lister ses propres disponibilités
    public function myDispos(Request $request)
    {
        return Disponibilite::where('user_id', $request->user()->id)->get();
    }

    // Prof: ajouter une disponibilité
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

    // Prof: supprimer une disponibilité
    public function destroy(Request $request, Disponibilite $disponibilite)
    {
        if ($disponibilite->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $disponibilite->delete();
        return response()->json(['message' => 'Disponibilité supprimée.']);
    }

    // Admin: voir les dispos d'un prof
    public function byProf($profId)
    {
        return Disponibilite::where('user_id', $profId)->get();
    }
}

// ===========================
// app/Http/Controllers/EmploiDuTempsController.php
// ===========================
namespace App\Http\Controllers;
use App\Models\EmploiDuTemps;
use App\Models\Etudiant;
use App\Mail\EmploiDuTempsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmploiDuTempsController extends Controller
{
    // PUBLIC: emploi du temps par niveau et parcours (pour la page d'accueil)
    public function public(Request $request)
    {
        $query = EmploiDuTemps::with(['prof', 'salle']);

        if ($request->filled('niveau'))  $query->where('niveau',  $request->niveau);
        if ($request->filled('parcours')) $query->where('parcours', $request->parcours);

        return $query->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                     ->orderBy('heure_debut')
                     ->get()
                     ->map(fn($e) => [
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

    // ADMIN: liste complète
    public function index()
    {
        return EmploiDuTemps::with(['prof', 'salle'])->get();
    }

    // ADMIN: créer
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'          => 'required|exists:users,id',
            'salle_id'         => 'required|exists:salles,id',
            'matiere'          => 'required|string|max:200',
            'niveau'           => 'required|in:L1,L2,L3,M1,M2',
            'parcours'         => 'required|string|max:100',
            'jour'             => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut'      => 'required|date_format:H:i',
            'heure_fin'        => 'required|date_format:H:i|after:heure_debut',
            'date_debut_semaine' => 'nullable|date',
        ]);

        $edt = EmploiDuTemps::create($data);
        return response()->json($edt->load(['prof', 'salle']), 201);
    }

    // ADMIN: modifier
    public function update(Request $request, EmploiDuTemps $emploiDuTemps)
    {
        $data = $request->validate([
            'user_id'          => 'sometimes|exists:users,id',
            'salle_id'         => 'sometimes|exists:salles,id',
            'matiere'          => 'sometimes|string|max:200',
            'niveau'           => 'sometimes|in:L1,L2,L3,M1,M2',
            'parcours'         => 'sometimes|string|max:100',
            'jour'             => 'sometimes|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut'      => 'sometimes|date_format:H:i',
            'heure_fin'        => 'sometimes|date_format:H:i',
            'date_debut_semaine' => 'nullable|date',
        ]);

        $emploiDuTemps->update($data);
        return response()->json($emploiDuTemps->load(['prof', 'salle']));
    }

    // ADMIN: supprimer
    public function destroy(EmploiDuTemps $emploiDuTemps)
    {
        $emploiDuTemps->delete();
        return response()->json(['message' => 'Cours supprimé.']);
    }

    // ADMIN: envoyer par email à tous les étudiants d'un niveau/parcours
    public function envoyerEmail(Request $request)
    {
        $request->validate([
            'niveau'  => 'required|in:L1,L2,L3,M1,M2',
            'parcours' => 'required|string',
        ]);

        $etudiants = Etudiant::where('niveau', $request->niveau)
                              ->where('parcours', $request->parcours)
                              ->get();

        if ($etudiants->isEmpty()) {
            return response()->json(['message' => 'Aucun étudiant trouvé pour ce niveau/parcours.'], 404);
        }

        $emplois = EmploiDuTemps::with(['prof', 'salle'])
            ->where('niveau',  $request->niveau)
            ->where('parcours', $request->parcours)
            ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
            ->orderBy('heure_debut')
            ->get();

        foreach ($etudiants as $etudiant) {
            Mail::to($etudiant->email)->send(new EmploiDuTempsMail($etudiant, $emplois));
        }

        return response()->json([
            'message' => "Emploi du temps envoyé à {$etudiants->count()} étudiant(s).",
        ]);
    }

    // ADMIN: envoyer par email aux profs
    public function envoyerEmailProfs(Request $request)
    {
        $emplois = EmploiDuTemps::with(['prof', 'salle'])->get();
        $profIds = $emplois->pluck('user_id')->unique();

        $profs = \App\Models\User::whereIn('id', $profIds)->get();

        foreach ($profs as $prof) {
            $emploisProf = $emplois->where('user_id', $prof->id)->values();
            Mail::to($prof->email)->send(new EmploiDuTempsMail($prof, $emploisProf, true));
        }

        return response()->json(['message' => "Emploi du temps envoyé à {$profs->count()} professeur(s)."]);
    }
}
