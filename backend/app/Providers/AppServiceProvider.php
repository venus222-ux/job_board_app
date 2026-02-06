<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Job;
use App\Observers\JobObserver;
use Elastic\Elasticsearch\ClientBuilder;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
 public function register()
{
$this->app->singleton(\App\Services\ElasticsearchService::class, function ($app) {
    return new \App\Services\ElasticsearchService();
});

}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
       Job::observe(JobObserver::class);
    }
}
