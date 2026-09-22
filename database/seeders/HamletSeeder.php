<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hamlet;

class HamletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hamlets = [
            [
                'name' => 'Dusun Jarak Lor',
                'code' => 'JL',
                'head_name' => 'Bpk. Suwandi',
                'head_phone' => '081234567801',
                'status' => 'active',
            ],
            [
                'name' => 'Dusun Jarak Kidul',
                'code' => 'JK',
                'head_name' => 'Bpk. Budi Santoso',
                'head_phone' => '081234567802',
                'status' => 'active',
            ],
            [
                'name' => 'Dusun Kalasan',
                'code' => 'KLS',
                'head_name' => 'Bpk. Agus Santoso',
                'head_phone' => '081234567803',
                'status' => 'active',
            ],
            [
                'name' => 'Dusun Sagi',
                'code' => 'SG',
                'head_name' => 'Bpk. Bambang Purnomo',
                'head_phone' => '081234567804',
                'status' => 'active',
            ],
            [
                'name' => 'Dusun Simbar',
                'code' => 'SB',
                'head_name' => 'Bpk. Djoko Supriyanto',
                'head_phone' => '081234567805',
                'status' => 'active',
            ],
        ];

        foreach ($hamlets as $h) {
            Hamlet::updateOrCreate(['code' => $h['code']], $h);
        }
    }
}
