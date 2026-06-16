<?php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use App\DTOs\Admin\DashboardFiltersData;

class DashboardRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'range' => 'nullable|in:7d,30d,90d',
        ];
    }

    public function dto(): DashboardFiltersData
    {
        return new DashboardFiltersData(
            range: $this->range ?? '30d'
        );
    }
}
