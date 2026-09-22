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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->enum('document_type', [
                'FOTO_KONDISI_AWAL',
                'FOTO_SURVEI_KASUN',
                'FOTO_PROGRES_50',
                'FOTO_SELESAI_100',
                'KTP_KK',
                'SURAT_KETERANGAN_DOKTER',
                'BAST_SCAN',
                'KUITANSI_SPJ'
            ]);
            $table->string('file_path');
            $table->string('original_filename')->nullable();
            $table->enum('visibility', ['PUBLIC_MASKED', 'INTERNAL_ONLY'])->default('INTERNAL_ONLY');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
