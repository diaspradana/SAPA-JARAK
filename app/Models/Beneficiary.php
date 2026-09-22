<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'nik',
        'kk_number',
        'phone',
        'hamlet_id',
        'rt',
        'rw',
        'address',
        'is_unregistered',
        'dtks_status',
    ];

    protected $casts = [
        'is_unregistered' => 'boolean',
    ];

    public function hamlet()
    {
        return $this->belongsTo(Hamlet::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Get masked name for public transparency (e.g. Bpk. S*****)
     */
    public function getMaskedNameAttribute(): string
    {
        $name = trim($this->name);
        if (empty($name)) return 'Warga Desa Jarak';

        $words = explode(' ', $name);
        $first = $words[0];
        if (count($words) > 1) {
            return $first . ' ' . substr($words[1], 0, 1) . '*****';
        }
        return substr($first, 0, 2) . '*****';
    }
}
