/**
 * vowelModel_mono.ts
 *
 * Korean Monophthong (단모음) Vowel Model - Coefficient Definitions
 *
 * This module provides interpolation coefficients for Korean vowels.
 * These coefficients are used by vowelBuilder.tsx to generate mouth shapes
 * by linear interpolation between basis vowels (ㅏ, ㅜ, ㅣ).
 *
 * Basis vectors (from calibration):
 *   open   - ㅏ movement (jaw opening)
 *   round  - ㅜ movement (lip rounding)
 *   spread - ㅣ movement (lip spreading)
 *
 * Usage:
 *   import { VOWEL_COEFFS_MONO } from './vowelModel_mono';
 *
 *   const coeffs = VOWEL_COEFFS_MONO['ㅔ'];
 *   // Returns: { open: 0.4, spread: 0.7, round: 0.0 }
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Coefficients for vowel synthesis in basis space
 */
export interface Coeffs {
  open: number; // Contribution from ㅏ (jaw opening)
  round: number; // Contribution from ㅜ (lip rounding)
  spread: number; // Contribution from ㅣ (lip spreading)
}

// ============================================================================
// Vowel Coefficients
// ============================================================================

/**
 * Empirically-derived coefficients for Korean vowels
 *
 * Each vowel is represented as a linear combination of three basis movements:
 *   - open:   jaw opening (ㅏ direction)
 *   - round:  lip rounding (ㅜ direction)
 *   - spread: lip spreading (ㅣ direction)
 *
 * Vowels using calibrated data directly (not interpolated):
 *   ㅏ, ㅜ, ㅣ (basis vowels), ㅑ, ㅠ (y-glide endpoints)
 *
 * Coefficients are derived from visual phonetics and articulatory studies.
 */
export const VOWEL_COEFFS_MONO: Record<string, Coeffs> = {
  // Interpolated vowels
  ㅓ: { open: 0.75, spread: 0.15, round: 0.5 }, // [ʌ] Mid-low back unrounded
  ㅔ: { open: 0.4, spread: 0.7, round: 0.0 }, // [e̞] Mid front unrounded
  ㅐ: { open: 0.4, spread: 0.7, round: 0.0 }, // [ɛ] → [e̞] (merged with ㅔ for most speakers)
  ㅗ: { open: 0.35, spread: -0.15, round: 0.85 }, // [o] Mid-high back rounded
  ㅛ: { open: 0.35, spread: -0.15, round: 0.85 }, // [jo] Static endpoint ≈ ㅗ
  ㅡ: { open: 0.2, spread: 0.8, round: 0.0 }, // [ɯ] High back unrounded
  ㅕ: { open: 0.75, spread: 0.15, round: 0.5 }, // [jʌ] Static endpoint ≈ more spread ㅓ
};

// ============================================================================
// Export Summary
// ============================================================================

/**
 * This module exports:
 * - VOWEL_COEFFS_MONO: Coefficient definitions for vowel interpolation
 * - Coeffs: TypeScript interface for coefficient structure
 *
 * These coefficients are used by vowelBuilder.tsx to generate mouth shapes
 * through linear interpolation of basis vowels (ㅏ, ㅜ, ㅣ) from calibration data.
 */
