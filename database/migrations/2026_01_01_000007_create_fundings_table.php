<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fundings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->enum('source', [
                'APBDES_DANA_DESA',
                'BKK_KABUPATEN',
                'DINSOS_KEDIRI',
                'BAZNAS_KEDIRI',
                'SWADAYA_WARGA'
            ])->default('APBDES_DANA_DESA');
            $table->string('fiscal_year', 4)->default('2026');
            $table->string('account_code', 50)->nullable(); // e.g. 02.01.05 Sub-Bidang Rehab RTLH
            $table->decimal('allocated_budget', 15, 2)->default(0);
            $table->decimal('realized_budget', 15, 2)->default(0);
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->enum('status', ['PLANNED', 'ALLOCATED', 'DISBURSED', 'RECONCILED'])->default('ALLOCATED');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fundings');
    }
};
