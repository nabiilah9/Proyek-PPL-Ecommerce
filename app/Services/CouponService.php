<?php

namespace App\Services;

use App\Models\Coupon;

/**
 * PPL-10 — Rule-Based System untuk kode diskon.
 *
 * Aturan dievaluasi berurutan; aturan pertama yang gagal menentukan pesan error.
 *   R1 kode harus ada
 *   R2 kupon harus aktif
 *   R3 harus berada di rentang tanggal berlaku
 *   R4 total belanja memenuhi minimum
 *   R5 kuota pemakaian belum habis
 *   R6 hitung potongan (persen dibatasi max_discount, nominal tetap)
 *   R7 potongan tidak boleh melebihi total belanja
 */
class CouponService
{
    /**
     * @return array{coupon: Coupon, discount: int}
     *
     * @throws \RuntimeException saat salah satu aturan gagal
     */
    public function evaluate(string $code, float $eligibleTotal): array
    {
        $code = strtoupper(trim($code));

        // R1
        $coupon = Coupon::whereRaw('UPPER(code) = ?', [$code])->first();

        if (!$coupon) {
            throw new \RuntimeException('Kode diskon tidak ditemukan.');
        }

        // R2
        if (!$coupon->is_active) {
            throw new \RuntimeException('Kode diskon sudah tidak aktif.');
        }

        // R3
        $now = now();

        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            throw new \RuntimeException('Kode diskon belum bisa dipakai.');
        }

        if ($coupon->ends_at && $now->gt($coupon->ends_at)) {
            throw new \RuntimeException('Kode diskon sudah kedaluwarsa.');
        }

        // R4
        if ($eligibleTotal < (float) $coupon->min_spend) {
            throw new \RuntimeException(
                'Minimal belanja untuk kode ini Rp '
                . number_format((float) $coupon->min_spend, 0, ',', '.') . '.'
            );
        }

        // R5
        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            throw new \RuntimeException('Kuota pemakaian kode diskon sudah habis.');
        }

        // R6
        $discount = $coupon->isPercent()
            ? $eligibleTotal * ((float) $coupon->value / 100)
            : (float) $coupon->value;

        if ($coupon->isPercent() && $coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        // R7
        $discount = min($discount, $eligibleTotal);

        return [
            'coupon' => $coupon,
            'discount' => (int) round($discount),
        ];
    }

    /**
     * Evaluasi tanpa melempar exception — untuk render halaman.
     *
     * @return array{coupon: Coupon, discount: int}|null
     */
    public function tryEvaluate(?string $code, float $eligibleTotal): ?array
    {
        if (!$code) {
            return null;
        }

        try {
            return $this->evaluate($code, $eligibleTotal);
        } catch (\RuntimeException) {
            return null;
        }
    }
}
