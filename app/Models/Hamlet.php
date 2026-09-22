<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hamlet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'head_name',
        'head_phone',
        'status',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
