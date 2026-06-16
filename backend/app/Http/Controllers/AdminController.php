<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DashboardRequest;
use App\Services\Admin\AdminDashboardService;

class AdminController extends Controller
{
    public function __construct(
        private AdminDashboardService $dashboardService
    ) {}

    public function index(DashboardRequest $request)
    {
        return response()->json(
            $this->dashboardService->dashboard(
                $request->dto()
            )
        );
    }
}
