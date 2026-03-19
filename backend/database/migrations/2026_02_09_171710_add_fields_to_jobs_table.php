<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('jobs', function (Blueprint $table) {
            $table->string('job_type')->nullable(); // full-time, part-time, contract
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->string('salary_currency', 5)->nullable(); // USD, EUR
            $table->string('salary_type')->nullable(); // hourly, monthly, yearly
            $table->boolean('is_remote')->default(false);
        });
    }

    public function down(): void {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn([
                'job_type', 'salary_min', 'salary_max',
                'salary_currency', 'salary_type', 'is_remote'
            ]);
        });
    }
};
