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
        Schema::create('verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->foreignId('verifier_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('verification_level', ['KASUN', 'DESA', 'MUSDES'])->default('KASUN');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('parameters_checklist')->nullable(); // Checklist scoring parameter faktual
            $table->integer('calculated_score')->default(0); // 0 - 100
            $table->enum('recommendation', ['LAYAK', 'DIKEMBALIKAN', 'TIDAK_LAYAK'])->default('LAYAK');
            $table->text('notes')->nullable();
            $table->text('signature_svg')->nullable(); // Tanda tangan digital
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verifications');
    }
};
