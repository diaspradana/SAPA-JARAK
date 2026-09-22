<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Funding extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'source',
        'fiscal_year',
        'account_code',
        'allocated_budget',
        'realized_budget',
        'approved_by',
        'approved_at',
        'status',
    ];

    protected $casts = [
        'allocated_budget' => 'float',
        'realized_budget' => 'float',
        'approved_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
