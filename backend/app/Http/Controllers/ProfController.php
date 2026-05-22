<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfController extends Controller
{
    public function index()
    {
        return User::where('role', 'prof')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|min:6',
            'specialite' => 'nullable|string',
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['role']     = 'prof';

        $prof = User::create($data);
        return response()->json($prof, 201);
    }

    public function show($id)
    {
        return User::where('role', 'prof')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $prof = User::findOrFail($id);

        $data = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:users,email,' . $id,
            'password'   => 'sometimes|min:6',
            'specialite' => 'nullable|string',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $prof->update($data);
        return response()->json($prof);
    }

    public function destroy($id)
    {
        $prof = User::findOrFail($id);
        $prof->delete();
        return response()->json(['message' => 'Professeur supprimé.']);
    }
}
