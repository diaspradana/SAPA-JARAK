<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Verification extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'verifier_id',
        'verification_level',
        'latitude',
        'longitude',
        'parameters_checklist',
        'calculated_score',
        'recommendation',
        'notes',
        'signature_svg',
        'verified_at',
    ];

    protected $casts = [
        'parameters_checklist' => 'array',
        'calculated_score' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'verified_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verifier_id');
    }
}
