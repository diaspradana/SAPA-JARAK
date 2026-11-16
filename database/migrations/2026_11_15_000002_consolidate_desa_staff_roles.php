<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereIn('role', ['kades', 'kasi_kesra', 'sekdes'])
            ->update(['role' => 'admin']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'kasun', 'public') NOT NULL DEFAULT 'public'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'kasun', 'kasi_kesra', 'sekdes', 'kades', 'public') NOT NULL DEFAULT 'public'");
        }
    }
};
