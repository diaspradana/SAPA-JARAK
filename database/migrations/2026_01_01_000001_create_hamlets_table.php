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
        Schema::create('hamlets', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100); // e.g. Dusun Kalasan
            $table->string('code', 10)->unique(); // e.g. KLS, JL, JK, SG, SB
            $table->string('head_name', 100)->nullable(); // Kasun Name
            $table->string('head_phone', 30)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hamlets');
    }
};
