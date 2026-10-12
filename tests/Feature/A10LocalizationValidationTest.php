<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Tests\TestCase;

class A10LocalizationValidationTest extends TestCase
{
    public function test_weak_password_with_id_locale_produces_indonesian_error_messages(): void
    {
        App::setLocale('id');

        $validator = Validator::make(
            ['password' => 'pendek'],
            ['password' => ['required', Password::defaults()]]
        );

        $this->assertTrue($validator->fails());
        $errors = $validator->errors()->get('password');

        // Pastikan pesan dalam Bahasa Indonesia
        $joinedErrors = implode(' ', $errors);

        $this->assertStringContainsString('Kata sandi harus memiliki minimal 10 karakter', $joinedErrors);
        $this->assertStringContainsString('Kata sandi harus mengandung setidaknya satu huruf besar dan satu huruf kecil', $joinedErrors);
        $this->assertStringContainsString('Kata sandi harus mengandung setidaknya satu angka', $joinedErrors);
    }
}
