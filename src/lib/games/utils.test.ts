import { initStats, resolveEnding, formatValue } from '@/components/game/TextGame';
import type { Stat, Ending, EndingCondition } from '@/lib/games/types';

describe('Game Utilities', () => {
  describe('initStats', () => {
    it('should initialize stats with initial values when provided', () => {
      const stats: Stat[] = [
        { key: 'rel', label: 'Relación', icon: '🤝', max: 100, initial: 50 },
        { key: 'mar', label: 'Margen', icon: '📈', max: 100 },
      ];

      const result = initStats(stats);

      expect(result.rel).toBe(50);
      expect(result.mar).toBe(50); // 50% of max 100
    });

    it('should initialize stats at 50% of max when no initial provided', () => {
      const stats: Stat[] = [
        { key: 'rel', label: 'Relación', icon: '🤝', max: 100 },
        { key: 'mar', label: 'Margen', icon: '📈', max: 200 },
      ];

      const result = initStats(stats);

      expect(result.rel).toBe(50);
      expect(result.mar).toBe(100); // 50% of 200
    });

    it('should handle money format stats', () => {
      const stats: Stat[] = [
        { key: 'cta', label: 'Valor de cuenta', icon: '💰', max: 60000, initial: 48000, format: 'money' },
      ];

      const result = initStats(stats);

      expect(result.cta).toBe(48000);
    });

    it('should return empty object for empty stats array', () => {
      const result = initStats([]);
      expect(result).toEqual({});
    });
  });

  describe('resolveEnding', () => {
    const mockEndings: Ending[] = [
      {
        id: 'exito',
        rank: 'S',
        title: 'Éxito Total',
        text: 'Ganaste',
        conditions: [{ stat: 'rel', min: 70 }, { stat: 'mar', min: 55 }],
      },
      {
        id: 'bueno',
        rank: 'A',
        title: 'Buen Resultado',
        text: 'Bien hecho',
        conditions: [{ stat: 'rel', min: 50 }],
      },
      {
        id: 'fracaso',
        rank: 'D',
        title: 'Fracaso',
        text: 'Perdiste',
      },
    ];

    it('should return first matching ending when all conditions met', () => {
      const stats = { rel: 80, mar: 60 };
      const result = resolveEnding(mockEndings, stats);
      expect(result.id).toBe('exito');
      expect(result.rank).toBe('S');
    });

    it('should return second ending when first conditions not met', () => {
      const stats = { rel: 60, mar: 40 };
      const result = resolveEnding(mockEndings, stats);
      expect(result.id).toBe('bueno');
      expect(result.rank).toBe('A');
    });

    it('should return fallback (last) ending when no conditions met', () => {
      const stats = { rel: 30, mar: 20 };
      const result = resolveEnding(mockEndings, stats);
      expect(result.id).toBe('fracaso');
      expect(result.rank).toBe('D');
    });

    it('should handle max conditions', () => {
      const endingsWithMax: Ending[] = [
        {
          id: 'alto',
          rank: 'S',
          title: 'Alto',
          conditions: [{ stat: 'rel', max: 50 }],
        },
        {
          id: 'bajo',
          rank: 'D',
          title: 'Bajo',
        },
      ];

      expect(resolveEnding(endingsWithMax, { rel: 30 }).id).toBe('alto');
      expect(resolveEnding(endingsWithMax, { rel: 70 }).id).toBe('bajo');
    });

    it('should handle min and max together', () => {
      const endingsMinMax: Ending[] = [
        {
          id: 'medio',
          rank: 'A',
          title: 'Medio',
          conditions: [{ stat: 'rel', min: 40, max: 70 }],
        },
        {
          id: 'fuera',
          rank: 'D',
          title: 'Fuera',
        },
      ];

      expect(resolveEnding(endingsMinMax, { rel: 50 }).id).toBe('medio');
      expect(resolveEnding(endingsMinMax, { rel: 30 }).id).toBe('fuera');
      expect(resolveEnding(endingsMinMax, { rel: 80 }).id).toBe('fuera');
    });
  });

  describe('formatValue', () => {
    it('should format money values with Chilean locale', () => {
      const stat = { format: 'money' as const };
      expect(formatValue(stat, 48000)).toBe('$48.000');
      expect(formatValue(stat, 1200000)).toBe('$1.200.000');
      expect(formatValue(stat, 0)).toBe('$0');
    });

    it('should format number values', () => {
      const stat = { format: 'number' as const };
      expect(formatValue(stat, 75)).toBe('75');
      expect(formatValue(stat, 0)).toBe('0');
    });

    it('should default to number format when not specified', () => {
      const stat = {} as any;
      expect(formatValue(stat, 42)).toBe('42');
    });

    it('should round decimal values', () => {
      const stat = { format: 'number' as const };
      expect(formatValue(stat, 42.7)).toBe('43');
      expect(formatValue(stat, 42.3)).toBe('42');
    });

    it('should handle money with decimals', () => {
      const stat = { format: 'money' as const };
      expect(formatValue(stat, 1234.56)).toBe('$1.235');
    });
  });
})
