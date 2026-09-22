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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 40)->unique()->index(); // e.g. #JRK-KLS-2026-009
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->foreignId('hamlet_id')->constrained('hamlets')->onDelete('cascade');
            $table->string('reporter_name')->nullable();
            $table->string('reporter_phone', 30)->nullable();
            $table->string('reporter_relationship', 50)->default('Diri Sendiri');
            $table->enum('assistance_type', ['DISABILITAS', 'RTLH'])->index();
            $table->enum('status', [
                'DRAFT',
                'SUBMITTED',
                'WAITING_KASUN_VERIFICATION',
                'KASUN_VERIFICATION',
                'RETURNED_WITH_NOTES',
                'FORWARDED_TO_VILLAGE',
                'VILLAGE_REVIEW',
                'REJECTED',
                'APPROVED',
                'FUNDING_ALLOCATED',
                'PROCUREMENT_IN_PROGRESS',
                'READY_FOR_HANDOVER',
                'COMPLETED'
            ])->default('SUBMITTED')->index();
            $table->text('description')->nullable();
            $table->text('needs_description')->nullable();
            $table->integer('priority_score')->default(0); // 0 - 100
            $table->string('urgency_level', 20)->default('SEDANG'); // RENDAH, SEDANG, TINGGI, KRITIS
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
