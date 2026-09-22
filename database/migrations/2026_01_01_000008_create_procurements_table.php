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
        Schema::create('procurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->json('rab_items')->nullable(); // Array of {item, volume, unit, price, total}
            $table->decimal('total_rab', 15, 2)->default(0);
            $table->integer('progress_percentage')->default(0); // 0, 50, 100
            $table->string('contractor_or_vendor')->nullable();
            $table->text('field_notes')->nullable();
            $table->date('start_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procurements');
    }
};
