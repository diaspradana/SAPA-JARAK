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
        Schema::create('handovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->string('bast_number', 60)->unique(); // e.g. 045.2/BAST-RTLH/09/2026
            $table->date('handover_date');
            $table->string('recipient_name');
            $table->foreignId('official_id')->nullable()->constrained('users')->onDelete('set null'); // Kades / Kasun
            $table->text('signature_recipient_svg')->nullable();
            $table->text('signature_official_svg')->nullable();
            $table->string('handover_photo_path')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_published_to_transparency')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('handovers');
    }
};
