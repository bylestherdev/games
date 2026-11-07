import { mulberry32, hashTexto } from '@/lib/games/random';
import { saveProgress, clearProgress, parse, progressKey } from '@/lib/games/progress';

describe('Random Utilities', () => {
  describe('mulberry32', () => {
    it('should produce deterministic sequence for same seed', () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(12345);

      for (let i = 0; i < 100; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('should produce different sequences for different seeds', () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(54321);

      let allSame = true;
      for (let i = 0; i < 100; i++) {
        if (rng1() !== rng2()) {
          return; // Different sequences found
        }
      }
      // If we get here, all values were the same (shouldn't happen)
      expect(true).toBe(false);
    });

    it('should produce values between 0 and 1', () => {
      const rng = mulberry32(12345);
      for (let i = 0; i < 1000; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('hashTexto', () => {
    it('should produce deterministic hash for same input', () => {
      expect(hashTexto('hello')).toBe(hashTexto('hello'));
      expect(hashTexto('world')).toBe(hashTexto('world'));
    });

    it('should produce different hashes for different inputs', () => {
      expect(hashTexto('hello')).not.toBe(hashTexto('world'));
    });

    it('should return 32-bit unsigned integer', () => {
      const hash = hashTexto('test');
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    });

    it('should be deterministic across calls', () => {
      const inputs = ['test', 'hello world', '12345', 'special chars !@#$%'];
      inputs.forEach(input => {
        expect(hashTexto(input)).toBe(hashTexto(input));
      });
    });
  });
})
