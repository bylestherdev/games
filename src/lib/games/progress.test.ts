import { saveProgress, clearProgress, parse, progressKey } from '@/lib/games/progress';

describe('Progress System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('progressKey', () => {
    it('should generate correct key with scope', () => {
      expect(progressKey('negociacion', 'veronica')).toBe('games:progress:negociacion:veronica');
    });

    it('should generate correct key without scope', () => {
      expect(progressKey('negociacion')).toBe('games:progress:negociacion');
    });
  });

  describe('saveProgress', () => {
    it('should save progress to localStorage', () => {
      const progress = {
        slug: 'negociacion',
        scope: 'veronica',
        phase: 'scene' as const,
        sceneId: 'investigacion',
        stats: { rel: 60, mar: 50, pal: 40 },
        log: [{ label: 'Test', result: 'Test result', n: 1 }],
        savedAt: Date.now(),
      };

      saveProgress(progress);

      const stored = localStorage.getItem('games:progress:negociacion:veronica');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.slug).toBe('negociacion');
      expect(parsed.scope).toBe('veronica');
      expect(parsed.phase).toBe('scene');
      expect(parsed.sceneId).toBe('investigacion');
      expect(parsed.stats.rel).toBe(60);
    });

    it('should overwrite existing progress', () => {
      const progress1 = {
        slug: 'test',
        scope: 'scope1',
        phase: 'scene' as const,
        sceneId: 'scene1',
        stats: { a: 1 },
        log: [],
        savedAt: 1000,
      };

      const progress2 = {
        slug: 'test',
        scope: 'scope1',
        phase: 'scene' as const,
        sceneId: 'scene2',
        stats: { a: 2 },
        log: [],
        savedAt: 2000,
      };

      saveProgress(progress1);
      saveProgress(progress2);

      const stored = localStorage.getItem('games:progress:test:scope1');
      const parsed = JSON.parse(stored!);
      expect(parsed.sceneId).toBe('scene2');
      expect(parsed.stats.a).toBe(2);
    });
  });

  describe('clearProgress', () => {
    it('should remove progress from localStorage', () => {
      const progress = {
        slug: 'test',
        scope: 'scope1',
        phase: 'scene' as const,
        sceneId: 'scene1',
        stats: { a: 1 },
        log: [],
        savedAt: Date.now(),
      };

      saveProgress(progress);
      expect(localStorage.getItem('games:progress:test:scope1')).not.toBeNull();

      clearProgress('test', 'scope1');
      expect(localStorage.getItem('games:progress:test:scope1')).toBeNull();
    });

    it('should handle clearing non-existent key', () => {
      expect(() => clearProgress('nonexistent')).not.toThrow();
    });
  });

  describe('parse', () => {
    it('should parse valid progress data', () => {
      const data = JSON.stringify({
        slug: 'test',
        scope: 'scope1',
        phase: 'scene',
        sceneId: 'scene1',
        stats: { a: 1 },
        log: [{ label: 'Test', result: 'Result', n: 1 }],
        savedAt: 1234567890,
      });

      const result = parse(data);
      expect(result).not.toBeNull();
      expect(result!.slug).toBe('test');
      expect(result!.sceneId).toBe('scene1');
    });

    it('should return null for invalid JSON', () => {
      expect(parse('invalid json')).toBeNull();
    });

    it('should return null for null input', () => {
      expect(parse(null)).toBeNull();
    });

    it('should return null for missing required fields', () => {
      expect(parse(JSON.stringify({ slug: 'test' }))).toBeNull();
      expect(parse(JSON.stringify({ sceneId: 'scene1' }))).toBeNull();
      expect(parse(JSON.stringify({ slug: 'test', sceneId: 'scene1', stats: 'invalid' }))).toBeNull();
    });

    it('should validate log array', () => {
      expect(parse(JSON.stringify({ 
        slug: 'test', 
        sceneId: 'scene1', 
        stats: {}, 
        log: 'not an array' 
      }))).toBeNull();

      expect(parse(JSON.stringify({ 
        slug: 'test', 
        sceneId: 'scene1', 
        stats: {}, 
        log: [] 
      }))).not.toBeNull();
    });
  });
})
