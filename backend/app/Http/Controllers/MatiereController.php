<?php

namespace App\Http\Controllers;

use App\Models\Matiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class MatiereController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Matiere::query();

            if ($request->filled('search')) {
                $query->search($request->search);
            }

            if ($request->filled('active') && ($request->active === 'true' || $request->active === '1')) {
                $query->active();
            }

            $sortBy = $request->input('sort_by', 'nom');
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            if ($request->filled('per_page')) {
                return response()->json($query->paginate($request->per_page));
            }

            return response()->json($query->get());
        } catch (\Exception $e) {
            Log::error('Erreur index matieres: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement des matières'], 500);
        }
    }

    public function list(Request $request)
    {
        try {
            $matieres = Matiere::active()
                ->orderBy('nom')
                ->get(['id', 'nom', 'code', 'couleur']);
            
            return response()->json($matieres);
        } catch (\Exception $e) {
            Log::error('Erreur list matieres: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:100|unique:matieres,nom',
                'code' => 'nullable|string|max:20|unique:matieres,code',
                'description' => 'nullable|string',
                'couleur' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
                'is_active' => 'boolean',
            ]);

            if (!isset($validated['couleur'])) {
                $validated['couleur'] = $this->generateRandomColor();
            }

            $matiere = Matiere::create($validated);

            Log::info('✅ Matière créée: ' . $matiere->nom);
            
            return response()->json([
                'success' => true,
                'message' => 'Matière créée avec succès',
                'data' => $matiere
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur store matiere: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $matiere = Matiere::withCount('emploisDuTemps')->findOrFail($id);
            return response()->json($matiere);
        } catch (\Exception $e) {
            Log::error('Erreur show matiere: ' . $e->getMessage());
            return response()->json(['error' => 'Matière non trouvée'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $matiere = Matiere::findOrFail($id);

            $validated = $request->validate([
                'nom' => [
                    'sometimes',
                    'string',
                    'max:100',
                    Rule::unique('matieres', 'nom')->ignore($id)
                ],
                'code' => [
                    'nullable',
                    'string',
                    'max:20',
                    Rule::unique('matieres', 'code')->ignore($id)
                ],
                'description' => 'nullable|string',
                'couleur' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
                'is_active' => 'boolean',
            ]);

            $matiere->update($validated);

            Log::info('✅ Matière mise à jour: ' . $matiere->nom);
            
            return response()->json([
                'success' => true,
                'message' => 'Matière mise à jour avec succès',
                'data' => $matiere
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur update matiere: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $matiere = Matiere::findOrFail($id);
            
            if ($matiere->emploisDuTemps()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette matière est utilisée dans des cours. Vous ne pouvez pas la supprimer.'
                ], 409);
            }

            $matiere->delete();

            Log::info('✅ Matière supprimée: ' . $matiere->nom);
            
            return response()->json([
                'success' => true,
                'message' => 'Matière supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur destroy matiere: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateRandomColor()
    {
        $colors = [
            '#2563EB', '#7C3AED', '#DC2626', '#059669', 
            '#D97706', '#9333EA', '#0891B2', '#4F46E5',
            '#0D9488', '#F59E0B', '#EF4444', '#8B5CF6'
        ];
        return $colors[array_rand($colors)];
    }
}