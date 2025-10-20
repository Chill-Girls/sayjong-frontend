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
 * Empirically-derived coefficients for Korean monophthongs (단모음)
 *
 * Each vowel is represented as a linear combination of three basis movements:
 *   - open:   jaw opening (ㅏ direction)
 *   - round:  lip rounding (ㅜ direction)
 *   - spread: lip spreading (ㅣ direction)
 *
 * Coefficients are derived from visual phonetics and articulatory studies.
 */
export const VOWEL_COEFFS_MONO: Record<string, Coeffs> = {
  // Pure monophthongs (excluding ㅏ, ㅜ, ㅣ - these use calibrated data)
  ㅓ: { open: 0.55, spread: 0.0, round: 0.0 }, // [ʌ] Mid-low back unrounded
  ㅔ: { open: 0.4, spread: 0.7, round: 0.0 }, // [e̞] Mid front unrounded
  ㅐ: { open: 0.42, spread: 0.68, round: 0.0 }, // [ɛ] → [e̞] (merged with ㅔ for most speakers)
  ㅗ: { open: 0.35, spread: -0.15, round: 0.85 }, // [o] Mid-high back rounded (raised)
  ㅛ: { open: 0.25, spread: -0.1, round: 0.9 }, // [jo] Diphthong, but mid back rounded
  ㅠ: { open: 0.12, spread: 0.15, round: 0.98 }, // [ju] Diphthong, but high rounded
  ㅡ: { open: 0.2, spread: 0.0, round: 0.0 }, // [ɯ] High back unrounded (fronted to [ɯ̟])
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
