<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\TransparencyService;

class PublicTransparencyController extends Controller
{
    protected TransparencyService $transparencyService;

    public function __construct(TransparencyService $transparencyService)
    {
        $this->transparencyService = $transparencyService;
    }

    /**
     * Get aggregate statistics and metrics.
     */
    public function metrics()
    {
        return response()->json([
            'success' => true,
            'data' => $this->transparencyService->getPublicMetrics(),
        ]);
    }

    /**
     * Get paginated and filtered public open ledger.
     */
    public function ledger(Request $request)
    {
        $filters = $request->only(['hamlet_id', 'assistance_type', 'search', 'per_page']);
        $result = $this->transparencyService->getPublicLedger($filters);

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'pagination' => [
                'current_page' => $result['current_page'],
                'last_page' => $result['last_page'],
                'total' => $result['total'],
            ],
        ]);
    }
}
