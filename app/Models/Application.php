<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'beneficiary_id',
        'hamlet_id',
        'reporter_name',
        'reporter_phone',
        'reporter_relationship',
        'assistance_type',
        'status',
        'description',
        'needs_description',
        'priority_score',
        'urgency_level',
        'submitted_at',
        'verified_at',
        'approved_at',
        'completed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'priority_score' => 'integer',
    ];

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function hamlet()
    {
        return $this->belongsTo(Hamlet::class);
    }

    public function verifications()
    {
        return $this->hasMany(Verification::class);
    }

    public function latestVerification()
    {
        return $this->hasOne(Verification::class)->latestOfMany();
    }

    public function assistance()
    {
        return $this->hasOne(Assistance::class);
    }

    public function funding()
    {
        return $this->hasOne(Funding::class);
    }

    public function procurement()
    {
        return $this->hasOne(Procurement::class);
    }

    public function handover()
    {
        return $this->hasOne(Handover::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
