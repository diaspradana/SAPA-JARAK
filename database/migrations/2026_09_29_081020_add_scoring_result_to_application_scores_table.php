<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Perluas tabel application_scores agar dapat menyimpan hasil agregat
     * scoring engine dari survei lapangan Kasun (satu baris per pengajuan).
     *
     * Kolom lama (`criterion_id`, `value`) tetap dipertahankan untuk
     * perhitungan per-kriteria, namun dibuat nullable karena baris agregat
     * tidak terikat pada satu kriteria tertentu.
     */
    public function up(): void
    {
        Schema::table('application_scores', function (Blueprint $table) {
            $table->foreignId('criterion_id')->nullable()->change();
            $table->float('value')->nullable()->change();

            $table->float('total_score')->default(0)->after('value');
            $table->json('breakdown')->nullable()->after('total_score');
            $table->string('urgency', 20)->default('RENDAH')->after('breakdown'); // RENDAH, SEDANG, TINGGI
            $table->boolean('is_eligible')->default(false)->after('urgency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus baris agregat terlebih dahulu agar kolom lama dapat
        // dikembalikan menjadi NOT NULL tanpa melanggar constraint.
        DB::table('application_scores')->whereNull('criterion_id')->delete();

        Schema::table('application_scores', function (Blueprint $table) {
            $table->dropColumn(['total_score', 'breakdown', 'urgency', 'is_eligible']);
        });

        Schema::table('application_scores', function (Blueprint $table) {
            $table->foreignId('criterion_id')->nullable(false)->change();
            $table->float('value')->nullable(false)->change();
        });
    }
};
