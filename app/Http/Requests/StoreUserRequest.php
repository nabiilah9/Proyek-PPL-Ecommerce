<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
                'required',
                'string',
                'min:10',
                'max:25',
                'regex:/^[a-zA-Z0-9_]+$/', // Only letters, numbers, and underscores
                'unique:users,username',
            ],
            'email' => [
                'required',
                'email',
                'min:16',
                'max:40',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:64',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/', // Must contain uppercase, lowercase, number
                // 'confirmed', // Requires password_confirmation field
            ],
        ];
    }

    /**
     * custom validation errors
     */
    public function messages(): array
    {
        return [
            'username.required' => 'The username field is required.',
            'username.string' => 'The username must be a valid string.',
            'username.min' => 'The username must be at least 10 characters long.',
            'username.max' => 'The username may not be greater than 25 characters.',
            'username.regex' => 'The username may only contain letters, numbers, and underscores.',
            'username.unique' => 'This username is already taken. Please choose a different one.',

            'email.required' => 'The email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.min' => 'The email address must be at least 16 characters long.',
            'email.max' => 'The email address must not exceed 40 characters.',
            'email.unique' => 'This email is already registered.',

            'password.required' => 'The password field is required.',
            'password.string' => 'The password must be a valid string.',
            'password.min' => 'The password must be at least 8 characters long.',
            'password.max' => 'The password must not exceed 64 characters.',
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, and one number.',
            // 'password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}