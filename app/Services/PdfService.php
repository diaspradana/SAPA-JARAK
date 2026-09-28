<?php

namespace App\Services;

use App\Models\Application;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

/**
 * Service to handle Server-Side PDF generation for SAPA-JARAK official documents.
 * Fulfills docs/04 Section 2.6 & PRD Sections 15, 20.
 */
class PdfService
{
    protected ReportingService $reportingService;

    public function __construct(ReportingService $reportingService)
    {
        $this->reportingService = $reportingService;
    }

    /**
     * Generate PDF Tanda Terima Pendaftaran Bantuan (Warga).
     */
    public function generateReceiptPdf(Application $application): Response
    {
        $application->load(['beneficiary', 'hamlet']);

        $pdf = Pdf::loadView('pdf.receipt', compact('application'))
            ->setPaper('a4', 'portrait');

        $cleanTicket = str_replace('#', '', $application->ticket_number);
        $filename = "Tanda_Terima_{$cleanTicket}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Generate PDF Berita Acara Serah Terima (BAST).
     */
    public function generateBastPdf(Application $application): Response
    {
        $application->load(['beneficiary', 'hamlet', 'funding', 'procurement', 'handover.official']);

        $pdf = Pdf::loadView('pdf.bast', compact('application'))
            ->setPaper('a4', 'portrait');

        $cleanTicket = str_replace('#', '', $application->ticket_number);
        $filename = "BAST_{$cleanTicket}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Generate PDF Laporan Pertanggungjawaban (SPJ) Realisasi Anggaran Desa.
     */
    public function generateSpjPdf(array $filters = []): Response
    {
        $reportData = $this->reportingService->generateSpjReport($filters);

        $pdf = Pdf::loadView('pdf.spj', $reportData)
            ->setPaper('a4', 'landscape');

        $year = $reportData['fiscal_year'] ?? date('Y');
        $filename = "Laporan_SPJ_Bansos_Desa_Jarak_{$year}.pdf";

        return $pdf->download($filename);
    }
}
