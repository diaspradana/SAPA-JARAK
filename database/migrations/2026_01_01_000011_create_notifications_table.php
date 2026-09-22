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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->nullable()->constrained('applications')->onDelete('cascade');
            $table->string('recipient_phone', 30);
            $table->string('recipient_name')->nullable();
            $table->string('channel', 20)->default('WHATSAPP');
            $table->string('event_type', 50); // OTP_VERIFICATION, TICKET_SUBMITTED, STATUS_CHANGED, etc.
            $table->text('message');
            $table->enum('status', ['QUEUED', 'SENT', 'FAILED'])->default('SENT');
            $table->string('otp_code', 10)->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
