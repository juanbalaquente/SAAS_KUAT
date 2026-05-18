<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Produto::where('ativo', true)->get()]);
    }

    public function store(Request $request)
    {
        $request->validate(['nome' => 'required', 'preco_cents' => 'required|integer', 'categoria' => 'required']);
        $p = Produto::create($request->all());
        return response()->json(['success' => true, 'data' => $p], 201);
    }

    public function show(int $id) { return response()->json(['success' => true, 'data' => Produto::findOrFail($id)]); }
    public function update(Request $request, int $id) { $p = Produto::findOrFail($id); $p->update($request->all()); return response()->json(['success' => true, 'data' => $p]); }
    public function destroy(int $id) { Produto::findOrFail($id)->update(['ativo' => false]); return response()->json(['success' => true]); }
}
