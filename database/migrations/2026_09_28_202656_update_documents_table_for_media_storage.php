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
            $table->foreignId('application_id')->nullable()->change();
            $table->string('public_file_path')->nullable()->after('file_path');
            $table->unsignedBigInteger('file_size')->nullable()->after('original_filename');
            $table->string('mime_type', 100)->nullable()->after('file_size');
            $table->text('description')->nullable()->after('visibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['public_file_path', 'file_size', 'mime_type', 'description']);
        });
    }
};
