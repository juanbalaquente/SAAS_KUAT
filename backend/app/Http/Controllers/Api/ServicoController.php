<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servico;
use Illuminate\Http\Request;

class ServicoController extends Controller
{
    public function index(Request $request)
    {
        $query = Servico::with('loja');
        if ($request->loja_id) $query->where('loja_id', $request->loja_id);
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $request->validate(['loja_id' => 'required', 'name' => 'required', 'duration_minutes' => 'required|integer', 'price_cents' => 'required|integer']);
        $servico = Servico::create($request->all());
        return response()->json(['success' => true, 'data' => $servico], 201);
    }

    public function show(int $id) { return response()->json(['success' => true, 'data' => Servico::findOrFail($id)]); }
    public function update(Request $request, int $id) { $s = Servico::findOrFail($id); $s->update($request->all()); return response()->json(['success' => true, 'data' => $s]); }
    public function destroy(int $id) { Servico::findOrFail($id)->delete(); return response()->json(['success' => true]); }
}
