<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Hamlet;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kls = Hamlet::where('code', 'KLS')->first();
        $jl  = Hamlet::where('code', 'JL')->first();
        $jk  = Hamlet::where('code', 'JK')->first();
        $sg  = Hamlet::where('code', 'SG')->first();
        $sb  = Hamlet::where('code', 'SB')->first();

        $users = [
            // Admin Desa
            [
                'name' => 'Administrator SAPA-JARAK',
                'email' => 'admin@jarak-kediri.desa.id',
                'phone' => '081234567000',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'hamlet_id' => null,
            ],
            // Pemerintah Desa Officials
            [
                'name' => 'Bpk. Ahmad Fauzi (Kasi Kesra)',
                'email' => 'kesra@jarak-kediri.desa.id',
                'phone' => '081234567001',
                'password' => Hash::make('password'),
                'role' => 'kasi_kesra',
                'hamlet_id' => null,
            ],
            [
                'name' => 'Bpk. Hendro Siswanto (Sekretaris Desa)',
                'email' => 'sekdes@jarak-kediri.desa.id',
                'phone' => '081234567002',
                'password' => Hash::make('password'),
                'role' => 'sekdes',
                'hamlet_id' => null,
            ],
            [
                'name' => 'Bpk. Drs. H. Supriyadi (Kepala Desa Jarak)',
                'email' => 'kades@jarak-kediri.desa.id',
                'phone' => '081234567003',
                'password' => Hash::make('password'),
                'role' => 'kades',
                'hamlet_id' => null,
            ],
            // 5 Kepala Dusun (Kasun)
            [
                'name' => 'Bpk. Agus Santoso (Kasun Kalasan)',
                'email' => 'kasun.kalasan@jarak-kediri.desa.id',
                'phone' => '081234567803',
                'password' => Hash::make('password'),
                'role' => 'kasun',
                'hamlet_id' => $kls?->id,
            ],
            [
                'name' => 'Bpk. Suwandi (Kasun Jarak Lor)',
                'email' => 'kasun.jaraklor@jarak-kediri.desa.id',
                'phone' => '081234567801',
                'password' => Hash::make('password'),
                'role' => 'kasun',
                'hamlet_id' => $jl?->id,
            ],
            [
                'name' => 'Bpk. Budi Santoso (Kasun Jarak Kidul)',
                'email' => 'kasun.jarakkidul@jarak-kediri.desa.id',
                'phone' => '081234567802',
                'password' => Hash::make('password'),
                'role' => 'kasun',
                'hamlet_id' => $jk?->id,
            ],
            [
                'name' => 'Bpk. Bambang Purnomo (Kasun Sagi)',
                'email' => 'kasun.sagi@jarak-kediri.desa.id',
                'phone' => '081234567804',
                'password' => Hash::make('password'),
                'role' => 'kasun',
                'hamlet_id' => $sg?->id,
            ],
            [
                'name' => 'Bpk. Djoko Supriyanto (Kasun Simbar)',
                'email' => 'kasun.simbar@jarak-kediri.desa.id',
                'phone' => '081234567805',
                'password' => Hash::make('password'),
                'role' => 'kasun',
                'hamlet_id' => $sb?->id,
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['phone' => $u['phone']], $u);
        }
    }
}
