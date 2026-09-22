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
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('nik', 20)->nullable()->index();
            $table->string('kk_number', 20)->nullable();
            $table->string('phone', 30)->nullable();
            $table->foreignId('hamlet_id')->constrained('hamlets')->onDelete('cascade');
            $table->string('rt', 5)->default('01');
            $table->string('rw', 5)->default('01');
            $table->text('address');
            $table->boolean('is_unregistered')->default(false); // Warga terlantar tanpa berkas
            $table->string('dtks_status', 50)->nullable(); // Desil 1, Desil 2, Belum Terdaftar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
