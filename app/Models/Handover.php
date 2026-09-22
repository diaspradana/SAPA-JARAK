<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Handover extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'bast_number',
        'handover_date',
        'recipient_name',
        'official_id',
        'signature_recipient_svg',
        'signature_official_svg',
        'handover_photo_path',
        'notes',
        'is_published_to_transparency',
    ];

    protected $casts = [
        'handover_date' => 'date',
        'is_published_to_transparency' => 'boolean',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function official()
    {
        return $this->belongsTo(User::class, 'official_id');
    }
}
