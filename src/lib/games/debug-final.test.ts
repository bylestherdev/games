import { registrarLogros } from '@/lib/games/achievements';

describe('Debug registrarLogros timestamp issue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return correct id (not timestamp)', () => {
    const ctx = { stats: {}, decisiones: 0, eventos: 0, flags: [] };
    const nuevos = registrarLogros('test', ['logro1'], { stats: {}, decisiones: 0, eventos: 0, flags: [] });
    console.log('Result:', JSON.stringify(nuevos, null, 2));
    console.log('ID type:', typeof nuevos[0].id);
    console.log('ID value:', nuevos[0].id);
    console.log('Fecha type:', typeof nuevos[0].fecha);
    console.log('Fecha value:', nuevos[0].fecha);
    expect(nuevos[0].id).toBe('logro1');
  });
});
