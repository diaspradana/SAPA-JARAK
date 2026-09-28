<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Criterion;

class CriteriaSeeder extends Seeder
{
    public function run(): void
    {
        Criterion::insert([
            [
                'name' => 'Penghasilan Per Bulan',
                'weight' => 0.40, // Bobot 40%
                'type' => 'cost',  // Cost: Makin kecil nilainya, makin diprioritaskan
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jumlah Tanggungan',
                'weight' => 0.30, // Bobot 30%
                'type' => 'benefit', // Benefit: Makin besar nilainya, makin diprioritaskan
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kondisi Rumah',
                'weight' => 0.30, // Bobot 30% (Skala nilai misal 1 - 5)
                'type' => 'benefit',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
