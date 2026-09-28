<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('application_scores', function (Blueprint $table) {
        $table->id();
        $table->foreignId('application_id')->constrained()->cascadeOnDelete();
        $table->foreignId('criterion_id')->constrained('criteria')->cascadeOnDelete();
        $table->float('value'); // Nilai mentah dari form survei/pendaftaran
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_scores');
    }
};
