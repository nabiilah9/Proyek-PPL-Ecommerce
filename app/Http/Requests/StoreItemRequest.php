<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'category_id'  => ['nullable', 'integer', 'exists:categories,id'],
            'name'         => ['required', 'string', 'max:100'],
            'unit'         => ['required', 'string', 'max:20'],
            'price'        => ['required', 'integer', 'min:0'],
            'stock'        => ['required', 'integer', 'min:0'],
            'image_url'    => ['nullable', 'string', 'max:255'],
            'is_available' => ['boolean'],
            'description'  => ['nullable', 'string'],
            'discount'     => ['numeric', 'min:0', 'max:100'],
            'expired_at'   => ['nullable', 'date'],
        ];
    }
}