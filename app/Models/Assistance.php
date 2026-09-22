<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assistance extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'item_name',
        'specification',
        'quantity',
        'unit',
        'estimated_cost',
        'actual_cost',
        'vendor_name',
        'status',
    ];

    protected $casts = [
        'estimated_cost' => 'float',
        'actual_cost' => 'float',
        'quantity' => 'integer',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
