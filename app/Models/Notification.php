<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'recipient_phone',
        'recipient_name',
        'channel',
        'event_type',
        'message',
        'status',
        'otp_code',
        'otp_expires_at',
        'sent_at',
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
