<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CalculateScoreRequest extends FormRequest
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
            'assistance_type' => ['required', 'string', 'in:RTLH,DISABILITAS'],

            // Parameters validation for RTLH
            'parameters' => ['required', 'array'],

            // RTLH specific parameters (boolean or 0/1)
            'parameters.dinding_rusak' => ['required_if:assistance_type,RTLH', 'boolean'],
            'parameters.lantai_tanah'  => ['required_if:assistance_type,RTLH', 'boolean'],
            'parameters.atap_bocor'    => ['required_if:assistance_type,RTLH', 'boolean'],
            'parameters.tidak_ada_mck' => ['required_if:assistance_type,RTLH', 'boolean'],

            // DISABILITAS specific parameters
            'parameters.tingkat_disabilitas' => ['required_if:assistance_type,DISABILITAS', 'integer', 'min:0', 'max:40'],
            'parameters.kondisi_ekonomi'     => ['required_if:assistance_type,DISABILITAS', 'integer', 'min:0', 'max:30'],
            'parameters.rekomendasi_nakes'   => ['required_if:assistance_type,DISABILITAS', 'boolean'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'assistance_type.required' => 'Jenis bantuan (assistance_type) wajib diisi.',
            'assistance_type.in' => 'Jenis bantuan harus berupa RTLH atau DISABILITAS.',
            'parameters.required' => 'Data parameter penilaian (parameters) wajib dikirimkan dalam format array/objek.',

            // RTLH
            'parameters.dinding_rusak.required_if' => 'Parameter kondisi dinding wajib disertakan untuk bantuan RTLH.',
            'parameters.lantai_tanah.required_if'  => 'Parameter kondisi lantai wajib disertakan untuk bantuan RTLH.',
            'parameters.atap_bocor.required_if'    => 'Parameter kondisi atap wajib disertakan untuk bantuan RTLH.',
            'parameters.tidak_ada_mck.required_if' => 'Parameter kondisi sanitasi MCK wajib disertakan untuk bantuan RTLH.',

            // Disabilitas
            'parameters.tingkat_disabilitas.required_if' => 'Nilai tingkat disabilitas wajib diisi untuk bantuan DISABILITAS.',
            'parameters.tingkat_disabilitas.min' => 'Nilai tingkat disabilitas minimal 0.',
            'parameters.tingkat_disabilitas.max' => 'Nilai tingkat disabilitas maksimal 40 poin.',
            'parameters.kondisi_ekonomi.required_if'     => 'Nilai kondisi ekonomi wajib diisi untuk bantuan DISABILITAS.',
            'parameters.kondisi_ekonomi.min' => 'Nilai kondisi ekonomi keluarga minimal 0.',
            'parameters.kondisi_ekonomi.max' => 'Nilai kondisi ekonomi keluarga maksimal 30 poin.',
            'parameters.rekomendasi_nakes.required_if'   => 'Rekomendasi nakes wajib ditentukan (true/false) untuk bantuan DISABILITAS.',
        ];
    }

    /**
     * Handle failed validation to return consistent JSON response.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi kriteria penilaian gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
