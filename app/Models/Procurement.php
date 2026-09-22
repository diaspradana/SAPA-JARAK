<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Procurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'rab_items',
        'total_rab',
        'progress_percentage',
        'contractor_or_vendor',
        'field_notes',
        'start_date',
        'completion_date',
    ];

    protected $casts = [
        'rab_items' => 'array',
        'total_rab' => 'float',
        'progress_percentage' => 'integer',
        'start_date' => 'date',
        'completion_date' => 'date',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
