<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profissional;
use Illuminate\Http\Request;

class ProfissionalController extends Controller
{
    public function index(Request $request)
    {
        $query = Profissional::with('loja');
        if ($request->loja_id) $query->where('loja_id', $request->loja_id);
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $request->validate(['loja_id' => 'required', 'name' => 'required']);
        $p = Profissional::create($request->all());
        return response()->json(['success' => true, 'data' => $p], 201);
    }

    public function show(int $id) { return response()->json(['success' => true, 'data' => Profissional::findOrFail($id)]); }
    public function update(Request $request, int $id) { $p = Profissional::findOrFail($id); $p->update($request->all()); return response()->json(['success' => true, 'data' => $p]); }
    public function destroy(int $id) { Profissional::findOrFail($id)->delete(); return response()->json(['success' => true]); }
}
