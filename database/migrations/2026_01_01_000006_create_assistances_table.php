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
        Schema::create('assistances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->string('item_name'); // Kursi Roda Standar / Paket Material RTLH
            $table->text('specification')->nullable();
            $table->integer('quantity')->default(1);
            $table->string('unit', 30)->default('Unit'); // Unit / Paket
            $table->decimal('estimated_cost', 15, 2)->default(0);
            $table->decimal('actual_cost', 15, 2)->default(0);
            $table->string('vendor_name')->nullable();
            $table->enum('status', ['PENDING', 'ORDERED', 'RECEIVED', 'DISTRIBUTED'])->default('PENDING');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assistances');
    }
};
