<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationScore extends Model
{
    protected $fillable = [
        'application_id',
        'criterion_id',
        'value',
        'total_score',
        'breakdown',
        'urgency',
        'is_eligible',
    ];

    protected $casts = [
        'value'       => 'float',
        'total_score' => 'float',
        'breakdown'   => 'array',
        'is_eligible' => 'boolean',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function criterion()
    {
        return $this->belongsTo(Criterion::class);
    }
}
