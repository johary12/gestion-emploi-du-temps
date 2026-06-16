<?php

namespace App\Http\Controllers;

use App\Models\EmploiDuTemps;
use App\Models\Etudiant;
use App\Mail\EmploiDuTempsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EmploiDuTempsController extends Controller
{
    public function public(Request $request)
    {
        try {
            $query = EmploiDuTemps::with(['prof', 'salle']);
            if ($request->filled('niveau'))   $query->where('niveau',   $request->niveau);
            if ($request->filled('parcours')) $query->where('parcours', $request->parcours);
            if ($request->filled('date_debut_semaine')) {
                $query->where('date_debut_semaine', $request->date_debut_semaine);
            }

            return $query->get()->map(fn($e) => [
                'id'          => $e->id,
                'matiere'     => $e->matiere,
                'niveau'      => $e->niveau,
                'parcours'    => $e->parcours,
                'jour'        => $e->jour,
                'heure_debut' => $e->heure_debut,
                'heure_fin'   => $e->heure_fin,
                'user_id'     => $e->user_id,
                'salle_id'    => $e->salle_id,
                'prof'        => $e->prof?->name,
                'salle'       => $e->salle?->nom,
                'date_debut_semaine' => $e->date_debut_semaine,
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur public EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement'], 500);
        }
    }

    public function index()
    {
        try {
            return EmploiDuTemps::with(['prof', 'salle'])->get();
        } catch (\Exception $e) {
            Log::error('Erreur index EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Erreur store EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la création'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Erreur update EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la modification'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            EmploiDuTemps::findOrFail($id)->delete();
            return response()->json(['message' => 'Cours supprimé.']);
        } catch (\Exception $e) {
            Log::error('Erreur destroy EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la suppression'], 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ NOUVELLES MÉTHODES POUR LES PROFESSEURS
    // ═══════════════════════════════════════════════════════════════

    /**
     * PROFESSEUR: Récupérer l'emploi du temps du professeur connecté pour la semaine actuelle
     */
    public function mySchedule(Request $request)
    {
        try {
            $weekStart = Carbon::now()->startOfWeek()->format('Y-m-d');
            
            Log::info('Chargement EDT professeur', [
                'user_id' => $request->user()->id,
                'week_start' => $weekStart
            ]);
            
            $courses = EmploiDuTemps::with(['prof', 'salle'])
                ->where('user_id', $request->user()->id)
                ->where('date_debut_semaine', $weekStart)
                ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                ->orderBy('heure_debut')
                ->get();
            
            Log::info('Cours trouvés', ['count' => $courses->count()]);
            
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Erreur mySchedule EDT: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors du chargement de votre emploi du temps',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PROFESSEUR: Récupérer l'emploi du temps du professeur pour une semaine spécifique
     */
    public function myScheduleByWeek(Request $request, $date)
    {
        try {
            $weekStart = Carbon::parse($date)->startOfWeek()->format('Y-m-d');
            
            Log::info('Chargement EDT professeur par semaine', [
                'user_id' => $request->user()->id,
                'week_start' => $weekStart,
                'date_reçue' => $date
            ]);
            
            $courses = EmploiDuTemps::with(['prof', 'salle'])
                ->where('user_id', $request->user()->id)
                ->where('date_debut_semaine', $weekStart)
                ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                ->orderBy('heure_debut')
                ->get();
            
            Log::info('Cours trouvés', ['count' => $courses->count()]);
            
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Erreur myScheduleByWeek EDT: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors du chargement de votre emploi du temps',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ADMIN: Récupérer les cours d'une semaine spécifique
     */
    public function getByWeek($date)
    {
        try {
            $weekStart = Carbon::parse($date)->startOfWeek()->format('Y-m-d');
            
            return EmploiDuTemps::with(['prof', 'salle'])
                ->where('date_debut_semaine', $weekStart)
                ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                ->orderBy('heure_debut')
                ->get();
        } catch (\Exception $e) {
            Log::error('Erreur getByWeek EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement'], 500);
        }
    }

    /**
     * ADMIN: Récupérer les cours d'un professeur pour une semaine
     */
    public function getByProfAndWeek($profId, $weekStart)
    {
        try {
            $weekStart = Carbon::parse($weekStart)->startOfWeek()->format('Y-m-d');
            
            return EmploiDuTemps::with(['prof', 'salle'])
                ->where('user_id', $profId)
                ->where('date_debut_semaine', $weekStart)
                ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                ->orderBy('heure_debut')
                ->get();
        } catch (\Exception $e) {
            Log::error('Erreur getByProfAndWeek EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement'], 500);
        }
    }

    /**
     * ADMIN: Filtrer les cours par critères
     */
    public function filterByCriteria(Request $request)
    {
        try {
            $query = EmploiDuTemps::with(['prof', 'salle']);

            if ($request->filled('niveau')) {
                $query->where('niveau', $request->niveau);
            }

            if ($request->filled('parcours')) {
                $query->where('parcours', $request->parcours);
            }

            if ($request->filled('week_start')) {
                $weekStart = Carbon::parse($request->week_start)->startOfWeek()->format('Y-m-d');
                $query->where('date_debut_semaine', $weekStart);
            }

            if ($request->filled('prof_id')) {
                $query->where('user_id', $request->prof_id);
            }

            return $query->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                ->orderBy('heure_debut')
                ->get();
        } catch (\Exception $e) {
            Log::error('Erreur filterByCriteria EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du filtrage'], 500);
        }
    }

    public function envoyerEmail(Request $request)
    {
        try {
            $request->validate([
                'niveau'   => 'required|in:L1,L2,L3,M1,M2',
                'parcours' => 'required|string',
            ]);

            Log::info('Envoi email EDT', [
                'niveau' => $request->niveau,
                'parcours' => $request->parcours
            ]);

            $etudiants = Etudiant::where('niveau',   $request->niveau)
                ->where('parcours', $request->parcours)
                ->get();

            if ($etudiants->isEmpty()) {
                return response()->json(['message' => 'Aucun étudiant trouvé.'], 404);
            }

            $weekStart = Carbon::now()->startOfWeek()->format('Y-m-d');
            
            $emplois = EmploiDuTemps::with(['prof', 'salle'])
                ->where('niveau',   $request->niveau)
                ->where('parcours', $request->parcours)
                ->where('date_debut_semaine', $weekStart)
                ->get();

            foreach ($etudiants as $etudiant) {
                Mail::to($etudiant->email)->send(new EmploiDuTempsMail($etudiant, $emplois));
            }

            return response()->json(['message' => "Email envoyé à {$etudiants->count()} étudiant(s)."]);
        } catch (\Exception $e) {
            Log::error('Erreur envoyerEmail EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'envoi des emails'], 500);
        }
    }

    public function envoyerEmailProfs()
    {
        try {
            $weekStart = Carbon::now()->startOfWeek()->format('Y-m-d');
            
            $emplois = EmploiDuTemps::with(['prof', 'salle'])
                ->where('date_debut_semaine', $weekStart)
                ->get();
                
            $profIds = $emplois->pluck('user_id')->unique();
            $profs   = \App\Models\User::whereIn('id', $profIds)->where('role', 'prof')->get();

            foreach ($profs as $prof) {
                $emploisProf = $emplois->where('user_id', $prof->id)->values();
                Mail::to($prof->email)->send(new EmploiDuTempsMail($prof, $emploisProf, true));
            }

            return response()->json(['message' => "Email envoyé à {$profs->count()} professeur(s)."]);
        } catch (\Exception $e) {
            Log::error('Erreur envoyerEmailProfs EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'envoi des emails'], 500);
        }
    }
}