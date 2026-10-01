<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => [
                'nullable',
                'string',
                'min:10',
                'max:25',
                'regex:/^[a-zA-Z0-9_]+$/',
                'unique:users,username,' . $this->user->id,
            ],
            'email' => [
                'nullable',
                'email',
                'min:16',
                'max:40',
                'unique:users,email,' . $this->user->id,
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'max:64',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/' . $this->user->id,
            ],
            'role' => ['nullable', 'in:ADMIN,CLIENT'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.string' => 'The username must be a valid string.',
            'username.min' => 'The username must be at least 10 characters long.',
            'username.max' => 'The username may not be greater than 25 characters.',
            'username.regex' => 'The username may only contain letters, numbers, and underscores.',
            'username.unique' => 'This username is already taken.',

            'email.email' => 'Please provide a valid email address.',
            'email.min' => 'The email must be at least 16 characters long.',
            'email.max' => 'The email may not exceed 40 characters.',
            'email.unique' => 'This email address is already in use.',

            'password.string' => 'The password must be a valid string.',
            'password.min' => 'The password must be at least 8 characters long.',
            'password.max' => 'The password may not exceed 64 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password.regex' => 'The password must include at least one uppercase letter, one lowercase letter, and one number.',

            'role.in' => 'The selected role is invalid. Valid options are ADMIN or CLIENT.',
        ];
    }
}