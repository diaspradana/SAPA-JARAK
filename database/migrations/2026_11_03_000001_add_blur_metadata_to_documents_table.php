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
        Schema::table('documents', function (Blueprint $table) {
            // BLURRED | NO_FACE | PENDING (ML unavailable, not published yet) | SKIPPED (non-citizen photo)
            $table->string('blur_status', 20)->nullable()->index()->after('public_file_path');
            $table->unsignedSmallInteger('faces_detected')->nullable()->after('blur_status');
            $table->unsignedBigInteger('public_file_size')->nullable()->after('file_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['blur_status']);
            $table->dropColumn(['blur_status', 'faces_detected', 'public_file_size']);
        });
    }
};
