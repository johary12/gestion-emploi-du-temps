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

    public function show($id)
    {
        try {
            return EmploiDuTemps::with(['prof', 'salle'])->findOrFail($id);
        } catch (\Exception $e) {
            Log::error('Erreur show EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Cours non trouvé'], 404);
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
                'heure_fin'          => 'sometimes|date_format:H:i|after:heure_debut',
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
            return response()->json(['message' => 'Cours supprimé avec succès.']);
        } catch (\Exception $e) {
            Log::error('Erreur destroy EDT: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la suppression'], 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ MÉTHODES POUR LES PROFESSEURS
    // ═══════════════════════════════════════════════════════════════

    public function mySchedule(Request $request)
    {
        try {
            $weekStart = Carbon::now()->startOfWeek()->format('Y-m-d');
            
            $courses = EmploiDuTemps::with(['prof', 'salle'])
                ->where('user_id', $request->user()->id)
                ->where('date_debut_semaine', $weekStart)
                ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                ->orderBy('heure_debut')
                ->get();
            
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Erreur mySchedule EDT: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors du chargement de votre emploi du temps',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function myScheduleByWeek(Request $request, $date)
    {
        try {
            $weekStart = Carbon::parse($date)->startOfWeek()->format('Y-m-d');
            
            $courses = EmploiDuTemps::with(['prof', 'salle'])
                ->where('user_id', $request->user()->id)
                ->where('date_debut_semaine', $weekStart)
                ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                ->orderBy('heure_debut')
                ->get();
            
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Erreur myScheduleByWeek EDT: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors du chargement de votre emploi du temps',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ MÉTHODES ADMIN AVANCÉES
    // ═══════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════
    // ✅ MÉTHODES D'ENVOI D'EMAILS - VERSION CORRIGÉE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Envoyer email aux étudiants avec l'emploi du temps
     */
    public function envoyerEmail(Request $request)
    {
        try {
            $validated = $request->validate([
                'niveau' => 'required|in:L1,L2,L3,M1,M2',
                'parcours' => 'required|string',
                'week_start' => 'nullable|date',
                'recipients' => 'nullable|array',
                'recipients.*' => 'integer|exists:etudiants,id',
                'subject' => 'nullable|string|max:255',
                'html_content' => 'nullable|string',
            ]);

            $weekStart = $validated['week_start'] 
                ? Carbon::parse($validated['week_start'])->startOfWeek()->format('Y-m-d')
                : Carbon::now()->startOfWeek()->format('Y-m-d');

            Log::info('📧 Envoi email EDT', [
                'niveau' => $validated['niveau'],
                'parcours' => $validated['parcours'],
                'week_start' => $weekStart,
                'has_recipients' => isset($validated['recipients']),
                'recipients_count' => isset($validated['recipients']) ? count($validated['recipients']) : 0,
                'has_html_content' => isset($validated['html_content'])
            ]);

            // Récupérer les étudiants
            if (isset($validated['recipients']) && !empty($validated['recipients'])) {
                $etudiants = Etudiant::whereIn('id', $validated['recipients'])->get();
            } else {
                $etudiants = Etudiant::where('niveau', $validated['niveau'])
                    ->where('parcours', $validated['parcours'])
                    ->get();
            }

            if ($etudiants->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun étudiant trouvé pour ces critères.'
                ], 404);
            }

            $subject = $validated['subject'] ?? "Emploi du temps ENI - Semaine du " . Carbon::parse($weekStart)->format('d/m/Y');
            $htmlContent = $validated['html_content'] ?? null;

            $sentCount = 0;
            $errors = [];

            foreach ($etudiants as $etudiant) {
                try {
                    // Vérifier que l'étudiant a un email
                    if (empty($etudiant->email)) {
                        Log::warning("⚠️ Étudiant sans email: {$etudiant->nom} (ID: {$etudiant->id})");
                        continue;
                    }

                    if ($htmlContent) {
                        // ✅ Envoyer avec le HTML personnalisé du frontend
                        // Utilisation de Mail::send avec un callback
                        Mail::send([], [], function ($message) use ($etudiant, $subject, $htmlContent) {
                            $message->to($etudiant->email, $etudiant->nom)
                                    ->subject($subject)
                                    ->html($htmlContent);
                        });
                    } else {
                        // Envoyer avec la vue Blade via Mailable
                        $emplois = $this->getEmploisForStudent(
                            $validated['niveau'], 
                            $validated['parcours'], 
                            $weekStart
                        );
                        
                        Mail::to($etudiant->email, $etudiant->nom)
                            ->send(new EmploiDuTempsMail(
                                $etudiant, 
                                $emplois, 
                                false,
                                $subject,
                                null
                            ));
                    }
                    
                    $sentCount++;
                    Log::info("✅ Email envoyé à: {$etudiant->email} ({$etudiant->nom})");
                } catch (\Exception $e) {
                    Log::error("❌ Erreur envoi email à {$etudiant->email}: " . $e->getMessage());
                    $errors[] = [
                        'email' => $etudiant->email,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Email envoyé à {$sentCount} étudiant(s).",
                'sent' => $sentCount,
                'total' => $etudiants->count(),
                'errors' => $errors
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ Erreur validation envoyerEmail: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('❌ Erreur envoyerEmail EDT: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi des emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les emplois du temps pour un étudiant
     */
    private function getEmploisForStudent($niveau, $parcours, $weekStart)
    {
        return EmploiDuTemps::with(['prof', 'salle'])
            ->where('niveau', $niveau)
            ->where('parcours', $parcours)
            ->where('date_debut_semaine', $weekStart)
            ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
            ->orderBy('heure_debut')
            ->get();
    }

    public function envoyerEmailProfs(Request $request)
    {
        try {
            $weekStart = $request->input('week_start')
                ? Carbon::parse($request->week_start)->startOfWeek()->format('Y-m-d')
                : Carbon::now()->startOfWeek()->format('Y-m-d');

            Log::info('📧 Envoi email EDT aux professeurs', ['week_start' => $weekStart]);

            $emplois = EmploiDuTemps::with(['prof', 'salle'])
                ->where('date_debut_semaine', $weekStart)
                ->get();

            if ($emplois->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun cours trouvé pour cette semaine.'
                ], 404);
            }

            $profIds = $emplois->pluck('user_id')->unique();
            $profs = \App\Models\User::whereIn('id', $profIds)
                ->where('role', 'prof')
                ->get();

            if ($profs->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun professeur trouvé.'
                ], 404);
            }

            $sentCount = 0;
            $errors = [];

            foreach ($profs as $prof) {
                try {
                    $emploisProf = $emplois->where('user_id', $prof->id)->values();
                    
                    if ($emploisProf->isEmpty()) {
                        continue;
                    }

                    $subject = $request->input('subject') ?? "Votre emploi du temps ENI - Semaine du " . Carbon::parse($weekStart)->format('d/m/Y');

                    Mail::to($prof->email, $prof->name)->send(new EmploiDuTempsMail(
                        $prof,
                        $emploisProf,
                        true,
                        $subject,
                        null
                    ));

                    $sentCount++;
                    Log::info("✅ Email envoyé au professeur: {$prof->email} ({$prof->name})");
                } catch (\Exception $e) {
                    Log::error("❌ Erreur envoi email au professeur {$prof->email}: " . $e->getMessage());
                    $errors[] = [
                        'email' => $prof->email,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Email envoyé à {$sentCount} professeur(s).",
                'sent' => $sentCount,
                'total' => $profs->count(),
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur envoyerEmailProfs EDT: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi des emails: ' . $e->getMessage()
            ], 500);
        }
    }
}