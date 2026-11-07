import { 
  ejecutarAccionLead, 
  calcularValorPipeline, 
  contarCalificados, 
  enfriarLeads,
  resolverFinal,
  generarLead,
  generarLeadsDia 
} from '@/lib/games/cazador-leads';
import type { Lead, EstadoLead, Temperatura, ResultadoAccion, FinalLead } from '@/lib/games/cazador-leads';

describe('Cazador de Leads - Game Logic', () => {
  const createMockLead = (overrides: Partial<any> = {}): any => ({
    id: 'lead-1',
    empresa: 'Test Corp',
    contacto: 'Juan Pérez',
    cargo: 'CTO',
    sector: 'SaaS',
    tamaño: 'pyme' as const,
    bant: { presupuesto: 70, necesidad: 80, autoridad: 90, plazo: 60 },
    temperatura: 'hot' as Temperatura,
    paciencia: 80,
    interes: 40,
    estado: 'nuevo' as EstadoLead,
    senales: ['Visitó pricing 3 veces'],
    resumen: 'Quiere ordenar operaciones',
    probabilidadCierre: 65,
    valorEstimado: 50000,
    ultimaInteraccion: Date.now(),
    notas: [],
    fuente: 'inbound',
    ...overrides,
  });

  describe('ejecutarAccionLead - Llamada', () => {
    it('should succeed when calling decision maker with high authority', () => {
      const lead = createMockLead({ 
        bant: { presupuesto: 70, necesidad: 80, autoridad: 90, plazo: 60 },
        temperatura: 'hot',
      });

      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.1); // Low value = success

      const result = ejecutarAccionLead(lead, 'llamada');

      expect(result.tipo).toBe('excelente');
      expect(result.lead.estado).toBe('contactado'); // Not 'calificado' anymore
      expect(result.lead.notas.some((n: string) => n.includes('Decisor confirmado'))).toBe(true);
      expect(result.lead.paciencia).toBeGreaterThanOrEqual(75);

      Math.random = originalRandom;
    });

    it('should fail when calling non-decision maker', () => {
      const lead = createMockLead({ 
        bant: { presupuesto: 70, necesidad: 80, autoridad: 30, plazo: 60 },
        temperatura: 'warm',
      });

      // Mock to make non-decisor path
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // High value = non-decisor

      const result = ejecutarAccionLead(lead, 'llamada');

      expect(result.tipo).toBe('malo');
      expect(result.lead.estado).toBe('contactado');
      expect(result.lead.interes).toBeLessThan(lead.interes);
      expect(result.lead.paciencia).toBeLessThan(lead.paciencia);

      Math.random = originalRandom;
    });

    it('should handle non-decision maker', () => {
      const lead = createMockLead({ 
        bant: { presupuesto: 70, necesidad: 80, autoridad: 30, plazo: 60 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // Force non-decisor

      const result = ejecutarAccionLead(lead, 'llamada');

      expect(result.tipo).toBe('malo');
      expect(result.texto).toContain('no decide');

      Math.random = originalRandom;
    });
  });

  describe('ejecutarAccionLead - Email', () => {
    it('should succeed with solid BANT', () => {
      const lead = createMockLead({ 
        bant: { presupuesto: 70, necesidad: 80, autoridad: 90, plazo: 60 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.3); // Response (prob 0.65 for solid)

      const result = ejecutarAccionLead(lead, 'email');

      expect(result.tipo).toBe('bueno');
      expect(result.texto).toContain('presupuesto confirmado');
      expect(result.lead.estado).toBe('contactado');

      Math.random = originalRandom;
    });

    it('should give neutral response for weak BANT', () => {
      const lead = createMockLead({ 
        bant: { presupuesto: 30, necesidad: 30, autoridad: 30, plazo: 30 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.1); // Response (prob 0.25 for weak BANT)

      const result = ejecutarAccionLead(lead, 'email');

      expect(result.tipo).toBe('neutro');
      expect(result.texto.toLowerCase().includes('evasiva'))

      Math.random = originalRandom;
    });

    it('should handle no response', () => {
      const lead = createMockLead({ 
        bant: { presupuesto: 30, necesidad: 30, autoridad: 30, plazo: 30 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // No response (prob ~0.25)

      const result = ejecutarAccionLead(lead, 'email');

      expect(result.tipo).toBe('malo');
      expect(result.texto).toContain('Sin respuesta');
      expect(result.lead.estado).toBe('enfriado');

      Math.random = originalRandom;
    });
  });

  describe('ejecutarAccionLead - LinkedIn', () => {
    it('should accept connection 65% of the time', () => {
      const lead = createMockLead({});

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.3); // Accept

      const result = ejecutarAccionLead(lead, 'linkedin');

      expect(result.tipo).toBe('bueno');
      expect(result.texto).toContain('Conectado');
      expect(result.lead.estado).toBe('contactado');

      Math.random = originalRandom;
    });
  });

  describe('ejecutarAccionLead - Demo', () => {
    it('should succeed with strong need and timeline', () => {
      const lead = createMockLead({ 
        bant: { necesidad: 80, plazo: 80, presupuesto: 60, autoridad: 60 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.3); // Success

      const result = ejecutarAccionLead(lead, 'demo');

      expect(result.tipo).toBe('excelente');
      expect(result.lead.estado).toBe('propuesta_enviada');
      expect(result.lead.probabilidadCierre).toBeGreaterThan(lead.probabilidadCierre);

      Math.random = originalRandom;
    });

    it('should fail with weak need/timeline', () => {
      const lead = createMockLead({ 
        bant: { necesidad: 30, plazo: 20, presupuesto: 60, autoridad: 60 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // Fail

      const result = ejecutarAccionLead(lead, 'demo');

      expect(result.tipo).toBe('malo');
      expect(result.lead.estado).toBe('enfriado');

      Math.random = originalRandom;
    });
  });

  describe('ejecutarAccionLead - Propuesta', () => {
    it('should succeed with strong BANT', () => {
      const lead = createMockLead({ 
        bant: { necesidad: 80, plazo: 80, presupuesto: 70, autoridad: 80 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.2); // Success

      const result = ejecutarAccionLead(lead, 'propuesta');

      expect(result.tipo).toBe('excelente');
      expect(result.lead.estado).toBe('calificado');
      expect(result.pipelineGenerado).toBeGreaterThan(0);

      Math.random = originalRandom;
    });

    it('should fail with weak BANT', () => {
      const lead = createMockLead({ 
        bant: { necesidad: 40, plazo: 30, presupuesto: 30, autoridad: 40 },
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // Fail

      const result = ejecutarAccionLead(lead, 'propuesta');

      expect(result.tipo).toBe('malo');
      expect(result.lead.estado).toBe('enfriado');

      Math.random = originalRandom;
    });
  });

  describe('ejecutarAccionLead - Seguimiento', () => {
    it('should reactivate cold leads 40% of the time', () => {
      const lead = createMockLead({ 
        estado: 'enfriado',
        interes: 20,
        paciencia: 20,
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.3); // Reactivate (40% chance)

      const result = ejecutarAccionLead(lead, 'seguimiento');

      expect(result.tipo).toBe('excelente');
      expect(result.lead.estado).toBe('contactado');
      expect(result.lead.interes).toBeGreaterThan(20);

      Math.random = originalRandom;
    });

    it('should lose cold leads permanently 60% of the time', () => {
      const lead = createMockLead({ 
        estado: 'enfriado',
        interes: 10,
        paciencia: 10,
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.8); // Fail to reactivate

      const result = ejecutarAccionLead(lead, 'seguimiento');

      expect(result.tipo).toBe('malo');
      expect(result.lead.estado).toBe('descartado');
      expect(result.texto).toContain('competidor');

      Math.random = originalRandom;
    });
  });

  describe('ejecutarAccionLead - Reunión', () => {
    it('should close high-value deals with strong BANT', () => {
      const lead = createMockLead({ 
        bant: { necesidad: 80, plazo: 80, presupuesto: 80, autoridad: 90 },
        valorEstimado: 100000,
      });

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.2); // Success

      const result = ejecutarAccionLead(lead, 'reunión');

      expect(result.tipo).toBe('excelente');
      expect(result.lead.estado).toBe('calificado');
      expect(result.pipelineGenerado).toBeGreaterThan(0);

      Math.random = originalRandom;
    });
  });

  describe('Pipeline Calculation', () => {
    it('should calculate pipeline from qualified leads', () => {
      const leads = [
        { estado: 'calificado', valorEstimado: 100000 },
        { estado: 'calificado', valorEstimado: 50000 },
        { estado: 'contactado', valorEstimado: 200000 },
        { estado: 'negociando', valorEstimado: 150000 },
      ];

      const pipeline = calcularValorPipeline(leads);
      expect(pipeline).toBe(300000); // 100K + 50K + 150K
    });

    it('should not count cold or discarded leads', () => {
      const leads = [
        { estado: 'calificado', valorEstimado: 100000 },
        { estado: 'enfriado', valorEstimado: 50000 },
        { estado: 'descartado', valorEstimado: 200000 },
      ];

      const pipeline = calcularValorPipeline(leads);
      expect(pipeline).toBe(100000);
    });
  });

  describe('contarCalificados', () => {
    it('should count qualified and negotiating leads', () => {
      const leads = [
        { estado: 'calificado' as const },
        { estado: 'negociando' as const },
        { estado: 'contactado' as const },
        { estado: 'enfriado' as const },
      ];

      expect(contarCalificados(leads)).toBe(2);
    });
  });

  describe('enfriarLeads', () => {
    it('should cool down new and contacted leads', () => {
      const leads = [
        { estado: 'nuevo' as const, paciencia: 50, interes: 30 },
        { estado: 'contactado' as const, paciencia: 60, interes: 40 },
        { estado: 'calificado' as const, paciencia: 80, interes: 80 },
      ];

      const enfriados = enfriarLeads(leads);

      expect(enfriados[0].paciencia).toBe(35);
      expect(enfriados[0].interes).toBe(25);
      expect(enfriados[0].estado).toBe('nuevo'); // paciencia > 0, stays 'nuevo'

      expect(enfriados[1].paciencia).toBe(45);
      expect(enfriados[1].interes).toBe(35);
      expect(enfriados[1].estado).toBe('contactado'); // paciencia 45 > 0, stays 'contactado'

      // Calificado should not change
      expect(enfriados[2].paciencia).toBe(80);
      expect(enfriados[2].interes).toBe(80);
      expect(enfriados[2].estado).toBe('calificado');
    });

    it('should mark as enfriado when paciencia reaches 0', () => {
      const leads = [
        { estado: 'nuevo' as const, paciencia: 10, interes: 20 },
      ];

      const enfriados = enfriarLeads(leads);

      expect(enfriados[0].paciencia).toBe(0);
      expect(enfriados[0].estado).toBe('enfriado');
      expect(enfriados[0].interes).toBe(15); // max(0, 20-5)
    });
  });

  describe('resolverFinal', () => {
    const finales = [
      { id: 'oro', rank: 'S', title: 'Oro', conditions: { pipelineMin: 350000, calificadosMin: 7 } },
      { id: 'plata', rank: 'A', title: 'Plata', conditions: { pipelineMin: 200000, calificadosMin: 5 } },
      { id: 'bronce', rank: 'B', title: 'Bronce', conditions: { pipelineMin: 120000, calificadosMin: 3 } },
      { id: 'hierro', rank: 'C', title: 'Hierro', conditions: { pipelineMin: 50000 } },
      { id: 'cero', rank: 'D', title: 'Cero', conditions: {} },
    ];

    it('should return S rank for excellent performance', () => {
      const leads = Array(8).fill({ estado: 'calificado' as const, valorEstimado: 50000 });
      const pipeline = 400000;
      const result = resolverFinal([
        { id: 'oro', rank: 'S', title: 'Oro', conditions: { pipelineMin: 350000, calificadosMin: 7 } },
        { id: 'plata', rank: 'A', title: 'Plata', conditions: { pipelineMin: 200000, calificadosMin: 5 } },
        { id: 'bronce', rank: 'B', title: 'Bronce', conditions: { pipelineMin: 120000, calificadosMin: 3 } },
        { id: 'hierro', rank: 'C', title: 'Hierro', conditions: { pipelineMin: 50000 } },
        { id: 'cero', rank: 'D', title: 'Cero' },
      ], Array(8).fill({ estado: 'calificado', valorEstimado: 50000 }), 400000);

      expect(result.rank).toBe('S');
    });

    it('should return D rank when conditions not met', () => {
      const leads = [{ estado: 'contactado', valorEstimado: 10000 }];
      const result = resolverFinal([
        { id: 'oro', rank: 'S', title: 'Oro', condicion: { pipelineMin: 350000 } },
        { id: 'cero', rank: 'D', title: 'Cero' },
      ], leads, 10000);

      expect(result.rank).toBe('D');
    });
  });

  describe('Lead Generation', () => {
    it('should generate leads with valid BANT scores', () => {
      const rng = () => 0.5;
      const lead = generarLead(rng, 'TechFlow', 10, 'test');

      expect(lead.id).toBe('lead-test-10');
      expect(typeof lead.empresa === 'string' && lead.empresa.length > 0).toBe(true);
      expect(lead.bant.presupuesto).toBeGreaterThanOrEqual(20);
      expect(lead.bant.presupuesto).toBeLessThanOrEqual(100);
      expect(lead.temperatura).toMatch(/^(hot|warm|cold)$/);
    });

    it('should assign temperature based on BANT score', () => {
      // High score -> hot
      const rngHigh = () => 0.9;
      const leadHigh = generarLead(rngHigh, 'TestCorp', 1, 'test');
      expect(leadHigh.temperatura).toBe('hot');

      // Low score -> cold
      const rngLow = () => 0.1;
      const leadLow = generarLead(rngLow, 'TestCorp', 1, 'test');
      expect(leadLow.temperatura).toBe('cold');
    });

    it('should generate daily leads', () => {
      const dia = { dia: 1, slots: 3, titulo: 'Test', llegada: ['TechFlow', 'PayFlow'], evento: 'Test' };
      const leads1 = generarLeadsDia(dia, 'escenario-test');
      const leads2 = generarLeadsDia(dia, 'escenario-test');

      expect(leads1.length).toBe(2);
      expect(leads1[0].empresa).toBeTruthy();
      expect(leads1[0].contacto).toBeTruthy();
      expect(leads2[0].empresa).toBeTruthy();
      expect(leads2[0].contacto).toBeTruthy();
    });
  });
});