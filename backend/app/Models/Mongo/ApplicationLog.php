<?php

namespace App\Models\Mongo;

use MongoDB\Laravel\Eloquent\Model;

class ApplicationLog extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'application_logs';

    protected $fillable = [
        'application_id',
        'event', // viewed, status_changed
        'meta',
        'created_at'
    ];
}
