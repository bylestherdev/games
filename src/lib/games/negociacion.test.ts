import { resolveEnding } from '@/components/game/TextGame';
import type { Ending } from '@/lib/games/types';

describe('Negociación Maestra - Game Logic', () => {
  const mockEndings = [
    {
      id: 'legend',
      rank: 'S',
      title: 'Maestra de la negociación',
      text: 'Lograste un contrato a 3 años con margen del 38% y cláusulas de renovación automática.',
      conditions: [
        { stat: 'rel', min: 70 },
        { stat: 'mar', min: 55 },
        { stat: 'pal', min: 55 },
      ],
    },
    {
      id: 'great',
      rank: 'A',
      title: 'Cierre profesional',
      text: 'Firmaste a 2 años con margen del 32% y condiciones estándar.',
      conditions: [
        { stat: 'rel', min: 50 },
        { stat: 'mar', min: 40 },
      ],
    },
    {
      id: 'bad',
      rank: 'D',
      title: '"Lo perspective".',
      text: 'La negociación se rompió.',
    },
  ];

  describe('resolveEnding', () => {
    it('should return S rank for excellent stats', () => {
      const stats = { rel: 80, mar: 60, pal: 60 };
      const result = resolveEnding([
        { id: 'legend', rank: 'S', title: 'Maestra', conditions: [{ stat: 'rel', min: 70 }, { stat: 'mar', min: 55 }, { stat: 'pal', min: 55 }] },
        { id: 'great', rank: 'A', title: 'Cierre', conditions: [{ stat: 'rel', min: 50 }, { stat: 'mar', min: 40 }] },
        { id: 'bad', rank: 'D', title: 'Fail', conditions: [] },
      ], stats);

      expect(result.rank).toBe('S');
    });

    it('should return A rank for good stats', () => {
      const stats = { rel: 60, mar: 50, pal: 30 };
      const result = resolveEnding([
        { id: 'legend', rank: 'S', title: 'Maestra', conditions: [{ stat: 'rel', min: 70 }, { stat: 'mar', min: 55 }, { stat: 'pal', min: 55 }] },
        { id: 'great', rank: 'A', title: 'Cierre', conditions: [{ stat: 'rel', min: 50 }, { stat: 'mar', min: 40 }] },
        { id: 'bad', rank: 'D', title: 'Fail', conditions: [] },
      ], stats);

      expect(result.rank).toBe('A');
    });

    it('should return D rank when conditions not met', () => {
      const stats = { rel: 30, mar: 20, pal: 10 };
      const result = resolveEnding([
        { id: 'legend', rank: 'S', title: 'Maestra', conditions: [{ stat: 'rel', min: 70 }, { stat: 'mar', min: 55 }, { stat: 'pal', min: 55 }] },
        { id: 'great', rank: 'A', title: 'Cierre', conditions: [{ stat: 'rel', min: 50 }, { stat: 'mar', min: 40 }] },
        { id: 'bad', rank: 'D', title: 'Fail', conditions: [] },
      ], stats);

      expect(result.rank).toBe('D');
    });

    it('should evaluate conditions in order', () => {
      const stats = { rel: 80, mar: 30, pal: 20 };
      const result = resolveEnding([
        { id: 'high', rank: 'S', title: 'High', conditions: [{ stat: 'rel', min: 70 }] },
        { id: 'low', rank: 'D', title: 'Low', conditions: [] },
      ], stats);

      expect(result.id).toBe('high');
    });

    it('should handle max conditions', () => {
      const endings = [
        { id: 'low', rank: 'S', title: 'Low', text: 'Low ending', conditions: [{ stat: 'rel', max: 50 }] },
        { id: 'high', rank: 'D', title: 'High', text: 'High ending', conditions: [] },
      ];

      expect(resolveEnding(endings, { rel: 30 }).id).toBe('low');
      expect(resolveEnding(endings, { rel: 70 }).id).toBe('high');
    });
  });
})
