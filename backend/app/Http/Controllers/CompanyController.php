<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    // Public: list all companies
    public function index()
    {
        return response()->json(
            Company::select('id', 'name', 'slug', 'description', 'logo', 'website')
                ->latest()
                ->get()
        );
    }

    // Public: get company by slug
    public function show($slug)
    {
        $company = Company::where('slug', $slug)->firstOrFail();
        return response()->json($company);
    }

    // Employer: list all companies for current user
    public function employerIndex()
    {
        $companies = Company::where('user_id', Auth::id())->get();
        return response()->json($companies);
    }

    // Employer: create company
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:companies',
            'description' => 'nullable',
            'website' => 'nullable|url',
            'logo' => 'nullable|image|max:2048',
        ]);

        $logoPath = $request->file('logo')?->store('logos', 'public');

        $company = Company::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'description' => $request->description,
            'website' => $request->website,
            'logo' => $logoPath,
        ]);

        return response()->json($company);
    }

    // Employer: update company
    public function update(Request $request, $id)
    {
        $company = Company::where('user_id', Auth::id())->where('id', $id)->firstOrFail();

        $request->validate([
            'name' => 'required|unique:companies,name,' . $company->id,
            'description' => 'nullable',
            'website' => 'nullable|url',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo) Storage::disk('public')->delete($company->logo);
            $company->logo = $request->file('logo')->store('logos', 'public');
        }

        $company->update([
            'name' => $request->name,
            'description' => $request->description,
            'website' => $request->website,
        ]);

        return response()->json($company);
    }

    // Employer: delete company
    public function destroy($id)
    {
        $company = Company::where('user_id', Auth::id())->where('id', $id)->firstOrFail();

        if ($company->logo) Storage::disk('public')->delete($company->logo);

        $company->delete();

        return response()->json(['message' => 'Company deleted']);
    }
}
