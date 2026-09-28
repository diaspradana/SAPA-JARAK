<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Criterion extends Model
{
    protected $fillable = ['name', 'weight', 'type'];

    public function scores()
    {
        return $this->hasMany(ApplicationScore::class);
    }
}
