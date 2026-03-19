<?php

namespace App\Models\Mongo;

use MongoDB\Laravel\Eloquent\Model;

class JobView extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'job_views';


    // Primary key (MongoDB ObjectId)
    protected $primaryKey = '_id';

    // Disable auto-incrementing since Mongo uses ObjectId
    public $incrementing = false;

    // Optional: tell Laravel _id is a string
    protected $keyType = 'string';

    // Fillable fields
    protected $fillable = [
        'job_id',
        'user_id',
        'ip',
        'source', // direct, search, etc
        'views',  // include total views
        'created_at',
        'updated_at',
    ];

    // Cast fields
    protected $casts = [
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
