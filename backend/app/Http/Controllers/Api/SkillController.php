<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{

    public function index()
    {
        return response()->json(Skill::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:skills,name']);
        $skill = Skill::create($request->only('name'));
        return response()->json($skill, 201);
    }

    public function show($id)
    {
        return response()->json(Skill::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $skill = Skill::findOrFail($id);
        $request->validate(['name' => 'required|string|unique:skills,name,' . $id]);
        $skill->update($request->only('name'));
        return response()->json($skill);
    }

    public function destroy($id)
    {
        $skill = Skill::findOrFail($id);
        $skill->delete();
        return response()->json(['message' => 'Skill deleted successfully.']);
    }
}
