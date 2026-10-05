import { describe, it, expect } from 'vitest';
import { computeLogoRect, getEccMaxLogoPercent } from './qrCustomRenderer';

describe('qrCustomRenderer logo calculation utils', () => {
  describe('getEccMaxLogoPercent', () => {
    it('returns correct maximum percentage for each ECC level', () => {
      expect(getEccMaxLogoPercent('L')).toBe(7);
      expect(getEccMaxLogoPercent('M')).toBe(15);
      expect(getEccMaxLogoPercent('Q')).toBe(25);
      expect(getEccMaxLogoPercent('H')).toBe(30);
    });
  });

  describe('computeLogoRect', () => {
    it('caps effective logo size based on ECC level', () => {
      const resL = computeLogoRect(280, { logoSize: 20, errorCorrectionLevel: 'L' }, 29, 2);
      expect(resL.effectiveLogoPercent).toBe(7);

      const resM = computeLogoRect(280, { logoSize: 20, errorCorrectionLevel: 'M' }, 29, 2);
      expect(resM.effectiveLogoPercent).toBe(15);

      const resH = computeLogoRect(280, { logoSize: 20, errorCorrectionLevel: 'H' }, 29, 2);
      expect(resH.effectiveLogoPercent).toBe(20);
    });

    it('preserves non-square aspect ratio for wide images', () => {
      const canvasWidth = 800;
      const res = computeLogoRect(
        canvasWidth,
        { logoSize: 20, errorCorrectionLevel: 'H' },
        29,
        2,
        200, // imgWidth
        100  // imgHeight (2:1 aspect ratio)
      );

      const rawSize = canvasWidth * 0.2; // 160
      expect(res.logoW).toBeCloseTo(rawSize, 1);
      expect(res.logoH).toBeCloseTo(rawSize / 2, 1);
    });

    it('preserves non-square aspect ratio for tall images', () => {
      const canvasWidth = 800;
      const res = computeLogoRect(
        canvasWidth,
        { logoSize: 20, errorCorrectionLevel: 'H' },
        29,
        2,
        100, // imgWidth
        200  // imgHeight (1:2 aspect ratio)
      );

      const rawSize = canvasWidth * 0.2; // 160
      expect(res.logoH).toBeCloseTo(rawSize, 1);
      expect(res.logoW).toBeCloseTo(rawSize / 2, 1);
    });

    it('calculates relative padding consistently across canvas sizes', () => {
      const options = { logoSize: 20, logoPadding: 2, errorCorrectionLevel: 'H' as const };

      const res280 = computeLogoRect(280, options, 29, 2);
      const res1024 = computeLogoRect(1024, options, 29, 2);

      expect(res280.paddingPx).toBeCloseTo(280 * 0.02, 1);
      expect(res1024.paddingPx).toBeCloseTo(1024 * 0.02, 1);
      // Ratio of padding to canvas width should be identical (0.02)
      expect(res280.paddingPx / 280).toBeCloseTo(res1024.paddingPx / 1024, 5);
    });

    it('computes correct cornerRadius based on logoBorderRadius option', () => {
      const squareRes = computeLogoRect(
        280,
        { logoSize: 20, logoBorderRadius: 'square', errorCorrectionLevel: 'H' },
        29,
        2
      );
      expect(squareRes.cornerRadius).toBe(0);

      const roundedRes = computeLogoRect(
        280,
        { logoSize: 20, logoBorderRadius: 'rounded', errorCorrectionLevel: 'H' },
        29,
        2
      );
      expect(roundedRes.cornerRadius).toBeGreaterThan(0);
      expect(roundedRes.cornerRadius).toBeLessThan(Math.min(roundedRes.clearedW, roundedRes.clearedH) / 2);

      const circleRes = computeLogoRect(
        280,
        { logoSize: 20, logoBorderRadius: 'circle', errorCorrectionLevel: 'H' },
        29,
        2
      );
      expect(circleRes.cornerRadius).toBeCloseTo(Math.min(circleRes.clearedW, circleRes.clearedH) / 2, 1);
    });

    it('aligns cleared zone to integer module boundaries and protects finder patterns', () => {
      const matrixSize = 29;
      const margin = 2;
      const res = computeLogoRect(
        280,
        { logoSize: 20, logoPadding: 2, errorCorrectionLevel: 'H' },
        matrixSize,
        margin
      );

      expect(Number.isInteger(res.clearedMinRow)).toBe(true);
      expect(Number.isInteger(res.clearedMaxRow)).toBe(true);
      expect(Number.isInteger(res.clearedMinCol)).toBe(true);
      expect(Number.isInteger(res.clearedMaxCol)).toBe(true);

      // Cleared zone must be strictly inside the matrix
      expect(res.clearedMinRow).toBeGreaterThanOrEqual(0);
      expect(res.clearedMaxRow).toBeLessThan(matrixSize);
      expect(res.clearedMinCol).toBeGreaterThanOrEqual(0);
      expect(res.clearedMaxCol).toBeLessThan(matrixSize);

      // Must not cover finder patterns (top-left is 0..6, 0..6)
      const coversTopLeftEye = res.clearedMinRow < 7 && res.clearedMinCol < 7;
      expect(coversTopLeftEye).toBe(false);
    });
  });
});
