<?php

namespace App\Http\Requests;

use App\Models\Application;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SubmitSurveyRequest extends CalculateScoreRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * Aturan parameter penilaian (RTLH / DISABILITAS) diwarisi dari
     * CalculateScoreRequest, sedangkan `assistance_type` selalu diambil dari
     * data pengajuan sehingga permintaan klien tidak dapat menggantinya.
     */
    public function rules(): array
    {
        $rules = parent::rules();

        // Jenis bantuan bersumber dari database (server-authoritative).
        $rules['assistance_type'] = ['nullable', 'string', 'in:RTLH,DISABILITAS'];

        return array_merge($rules, [
            // Bukti survei lapangan
            'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
            'recommendation' => ['nullable', 'string', 'in:LAYAK,DIKEMBALIKAN,TIDAK_LAYAK'],
            'notes'          => ['nullable', 'string', 'max:2000'],
            'signature_svg'  => ['nullable', 'string'],
        ]);
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $application = Application::find($this->route('id'));

        $this->merge([
            'assistance_type' => $application?->assistance_type,
        ]);
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'latitude.numeric'  => 'Koordinat lintang (latitude) harus berupa angka.',
            'latitude.between'  => 'Koordinat lintang (latitude) harus berada di antara -90 sampai 90.',
            'longitude.numeric' => 'Koordinat bujur (longitude) harus berupa angka.',
            'longitude.between' => 'Koordinat bujur (longitude) harus berada di antara -180 sampai 180.',
            'recommendation.in' => 'Rekomendasi survei harus salah satu dari: LAYAK, DIKEMBALIKAN, atau TIDAK_LAYAK.',
            'notes.max'         => 'Catatan survei maksimal 2000 karakter.',
        ]);
    }

    /**
     * Handle failed validation to return consistent JSON response.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi data survei lapangan gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
