<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppNotificationService
{
    /**
     * Send OTP Verification WhatsApp Message.
     */
    public function sendOtp(string $phone, string $otpCode, ?string $recipientName = null): Notification
    {
        $message = "🏛️ *SAPA-JARAK — PEMERINTAH DESA JARAK*\n\n"
                 . "Kode verifikasi (OTP) pengajuan bantuan Anda:\n"
                 . "*{$otpCode}*\n\n"
                 . "Gunakan kode ini untuk menyelesaikan permohonan. Kode berlaku selama 10 menit. Jangan berikan kode ini kepada orang lain.";

        return $this->dispatchMessage($phone, $recipientName, 'OTP_VERIFICATION', $message, null, $otpCode);
    }

    /**
     * Send status update notification.
     */
    public function notifyStatusChange(Application $application, string $newStatus, ?string $customNotes = null): Notification
    {
        $phone = $application->reporter_phone ?? ($application->beneficiary->phone ?? '081234567890');
        $name = $application->reporter_name ?? $application->beneficiary->name;
        $ticket = $application->ticket_number;
        $type = $application->assistance_type === 'RTLH' ? 'Rehabilitasi RTLH' : 'Alat Bantu Disabilitas';

        $statusText = match ($newStatus) {
            'SUBMITTED' => 'Diterima di Sistem',
            'WAITING_KASUN_VERIFICATION' => 'Menunggu Jadwal Verifikasi Kasun',
            'KASUN_VERIFICATION' => 'Kasun Sedang Meninjau Lokasi Faktual',
            'RETURNED_WITH_NOTES' => 'Dikembalikan untuk Klarifikasi/Perbaikan',
            'FORWARDED_TO_VILLAGE' => 'Direkomendasikan ke Pemerintah Desa',
            'VILLAGE_REVIEW' => 'Sedang Diverifikasi Tim Desa & Musdes',
            'APPROVED' => 'Disetujui & Ditetapkan Pagu Anggaran',
            'PROCUREMENT_IN_PROGRESS' => 'Pengadaan / Pengerjaan Material Dimulai',
            'READY_FOR_HANDOVER' => 'Selesai Fisik & Menunggu Penandatanganan BAST',
            'COMPLETED' => 'Selesai & Diserahterimakan',
            'REJECTED' => 'Belum Memenuhi Kriteria Musdes',
            default => $newStatus,
        };

        $message = "🏛️ *SAPA-JARAK — UPDATE STATUS PENGAJUAN*\n\n"
                 . "Yth. Bpk/Ibu *{$name}*,\n"
                 . "Pengajuan *{$type}* Anda dengan tiket:\n"
                 . "*{$ticket}*\n\n"
                 . "Status Saat Ini: *{$statusText}*\n";

        if (!empty($customNotes)) {
            $message .= "Catatan Petugas: {$customNotes}\n";
        }

        $message .= "\nLacak perkembangan real-time di website SAPA-JARAK: " . config('app.url') . "/lacak";

        return $this->dispatchMessage($phone, $name, 'STATUS_CHANGED', $message, $application->id);
    }

    /**
     * Internal dispatcher supporting simulation mode or external gateway API.
     */
    protected function dispatchMessage(string $phone, ?string $name, string $eventType, string $message, ?int $applicationId = null, ?string $otp = null): Notification
    {
        $simulation = config('services.whatsapp.simulation', true);
        $status = 'SENT';

        if (!$simulation) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => config('services.whatsapp.token'),
                ])->post(config('services.whatsapp.url'), [
                    'target' => $phone,
                    'message' => $message,
                ]);

                if (!$response->successful()) {
                    $status = 'FAILED';
                    Log::warning("WhatsApp dispatch failed: " . $response->body());
                }
            } catch (\Exception $e) {
                $status = 'FAILED';
                Log::error("WhatsApp Gateway Exception: " . $e->getMessage());
            }
        }

        return Notification::create([
            'application_id' => $applicationId,
            'recipient_phone' => $phone,
            'recipient_name' => $name,
            'channel' => 'WHATSAPP',
            'event_type' => $eventType,
            'message' => $message,
            'status' => $status,
            'otp_code' => $otp,
            'otp_expires_at' => $otp ? now()->addMinutes(10) : null,
            'sent_at' => now(),
        ]);
    }
}
