<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => User::all()]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required', 'email' => 'required|email|unique:users', 'password' => 'required|min:6', 'role' => 'required']);
        $user = User::create([...$request->all(), 'password' => Hash::make($request->password)]);
        return response()->json(['success' => true, 'data' => $user], 201);
    }

    public function show(int $id)
    {
        return response()->json(['success' => true, 'data' => User::findOrFail($id)]);
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);
        $data = $request->except('password');
        if ($request->password) $data['password'] = Hash::make($request->password);
        $user->update($data);
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function destroy(int $id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
