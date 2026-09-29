<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class VillageApplicationFilterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'assistance_type' => ['nullable', 'string', 'in:RTLH,DISABILITAS'],
            'hamlet_id'       => ['nullable', 'integer', 'exists:hamlets,id'],
            'urgency_level'   => ['nullable', 'string', 'in:RENDAH,SEDANG,TINGGI'],
            'search'          => ['nullable', 'string', 'max:100'],
            'sort_by'         => ['nullable', 'string', 'in:score,submitted_at'],
            'sort_dir'        => ['nullable', 'string', 'in:asc,desc'],
            'per_page'        => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'            => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'assistance_type.in' => 'Filter jenis bantuan harus berupa RTLH atau DISABILITAS.',
            'hamlet_id.integer'  => 'Filter dusun (hamlet_id) harus berupa angka.',
            'hamlet_id.exists'   => 'Dusun (hamlet_id) yang dipilih tidak ditemukan.',
            'urgency_level.in'   => 'Filter tingkat urgensi harus salah satu dari: TINGGI, SEDANG, atau RENDAH.',
            'search.string'      => 'Kata kunci pencarian harus berupa teks.',
            'search.max'         => 'Kata kunci pencarian maksimal 100 karakter.',
            'sort_by.in'         => 'Pengurutan (sort_by) hanya mendukung: score atau submitted_at.',
            'sort_dir.in'        => 'Arah pengurutan (sort_dir) hanya mendukung: asc atau desc.',
            'per_page.integer'   => 'Jumlah data per halaman (per_page) harus berupa angka.',
            'per_page.min'       => 'Jumlah data per halaman (per_page) minimal 1.',
            'per_page.max'       => 'Jumlah data per halaman (per_page) maksimal 100.',
            'page.integer'       => 'Nomor halaman (page) harus berupa angka.',
            'page.min'           => 'Nomor halaman (page) minimal 1.',
        ];
    }

    /**
     * Handle failed validation to return consistent JSON response.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi parameter filter daftar pengajuan desa gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
