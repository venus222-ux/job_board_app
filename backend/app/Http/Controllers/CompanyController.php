<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Services\Company\CompanyService;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    public function __construct(
        private CompanyService $companyService
    ) {}

    // Public: list companies
    public function index()
    {
        return response()->json(
            $this->companyService->listCompanies()
        );
    }

    // Public: show company by slug
    public function show($slug)
    {
        return response()->json(
            $this->companyService->getBySlug($slug)
        );
    }

    // Employer: list own companies
    public function employerIndex()
    {
        return response()->json(
            $this->companyService->getEmployerCompanies(Auth::id())
        );
    }

    // Employer: create
    public function store(StoreCompanyRequest $request)
    {
        return response()->json(
            $this->companyService->createCompany(
                $request->validated(),
                Auth::id(),
                $request->file('logo')
            )
        );
    }

    // Employer: update
    public function update(UpdateCompanyRequest $request, $id)
    {
        return response()->json(
            $this->companyService->updateCompany(
                $id,
                $request->validated(),
                Auth::id(),
                $request->file('logo')
            )
        );
    }

    // Employer: delete
    public function destroy($id)
    {
        $this->companyService->deleteCompany($id, Auth::id());

        return response()->json([
            'message' => 'Company deleted'
        ]);
    }
}
