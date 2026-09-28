<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationScore extends Model
{
    protected $fillable = ['application_id', 'criterion_id', 'value'];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function criterion()
    {
        return $this->belongsTo(Criterion::class);
    }
}
