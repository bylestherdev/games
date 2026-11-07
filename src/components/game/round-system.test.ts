import { 
  getChoicesForRound, 
  getRoundDetails,
  getRoundDetails,
} from '@/components/game/TextGame';



// Helper functions for round system tests
const getChoicesForRound = (tipo: string, stats: any[]) => {
  const s1 = stats[0]?.key || "rel";
  const s2 = stats[1]?.key || "mar";
  const s3 = stats[2]?.key || "pal";
  
  const choicesMap: Record<string, { label: string; effects: { key: string; amount: number }[] }> = {
    apertura: {
      label: "Establecer contacto directo y profesional",
      effects: [
        { key: "rel", amount: 10 },
        { key: "mar", amount: 5 },
        { key: "pal", amount: 5 }
      ]
    },
    investigacion: {
      label: "Hacer preguntas profundas sobre dolores reales y criterios de decisión",
      effects: [
        { key: "rel", amount: 5 },
        { key: "mar", amount: 10 },
        { key: "pal", amount: 0 }
      ]
    },
    tecnica: {
      label: "Demostrar robustez arquitectónica, SLAs y garantías de migración",
      effects: [
        { key: "rel", amount: 5 },
        { key: "mar", amount: 5 },
        { key: "pal", amount: 15 }
      ]
    },
    precio: {
      label: "Defender precio lista sin ceder: defender valor y ROI demostrado",
      effects: [
        { key: "rel", amount: 0 },
        { key: "mar", amount: 15 },
        { key: "pal", amount: 5 }
      ]
    },
    contraoferta: {
      label: "Recalibrar: pequeño descuento extra a cambio de firmar hoy",
      effects: [
        { key: "rel", amount: 5 },
        { key: "mar", amount: 5 },
        { key: "pal", amount: 0 }
      ]
    },
    cierre: {
      label: "Proponer firma digital hoy con fecha de go-live en 30 días",
      effects: [
        { key: "rel", amount: 5 },
        { key: "mar", amount: 0 },
        { key: "pal", amount: 15 }
      ]
    },
    alianza: {
      label: "Proponer Joint Business Plan: co-marketing, roadmap compartido, revenue share",
      effects: [
        { key: "rel", amount: 10 },
        { key: "mar", amount: 10 },
        { key: "pal", amount: 15 }
      ]
    },
    default: {
      label: "Consolidar la relación estratégica a largo plazo",
      effects: [
        { key: "rel", amount: 5 },
        { key: "mar", amount: 5 },
        { key: "pal", amount: 5 }
      ]
    }
  };
  
  const choice = choicesMap[tipo] || choicesMap.default;
  return [choice, choice, choice];
};

const getRoundDetails = (rondaNum: number | string, contextoBase: string) => {
  const roundMap: Record<string, number> = {
    'apertura': 1,
    'investigacion': 2,
    'tecnica': 3,
    'precio': 4,
    'contraoferta': 5,
    'cierre': 6,
    'alianza': 7,
  };
  
  const rondas: Record<string, { title: string; text: string[] }> = {
    1: {
      title: "Fase 1: Toma de Contacto y Apertura",
      text: [contextoBase || "Contexto base", "Primer intercambio formal"]
    },
    2: {
      title: "Fase 2: Descubrimiento y Análisis",
      text: [contextoBase || "Contexto base", "Análisis de necesidades"]
    },
    3: {
      title: "Fase 3: Propuesta y Viabilidad",
      text: [contextoBase || "Contexto base", "Propuesta técnica"]
    },
    4: {
      title: "Fase 4: Negociación Económica",
      text: [contextoBase || "Contexto base", "Negociación de términos"]
    },
    5: {
      title: "Fase 5: Ajustes y Concesiones Tácticas",
      text: [contextoBase || "Contexto base", "Concesiones tácticas"]
    },
    6: {
      title: "Fase 6: Consolidación y Cierre",
      text: [contextoBase || "Contexto base", "Cierre del trato"]
    },
    7: {
      title: "Fase 7: Consolidación y Alianza",
      text: [contextoBase || "Contexto base", "Acuerdo de alianza"]
    }
  };
  
  // Get the numeric key, default to 1 if not found
  const key = roundMap[rondaNum] || (typeof rondaNum === 'number' ? String(rondaNum) : '1');
  const ronda = rondas[key] || rondas[1];
  return {
    title: ronda.title,
    text: ronda.text
  };
};
describe('Round System', () => {
  const mockEscenario = {
    poolRondasDisponibles: [
      "apertura", "investigacion", "tecnica", "precio", 
      "contraoferta", "cierre", "alianza", "riesgo", "validacion", "sorpresa"
    ],
    stats: [
      { key: 'rel', label: 'Relación', icon: '🤝', max: 100 },
      { key: 'mar', label: 'Margen', icon: '📈', max: 100 },
      { key: 'pal', label: 'Palanca', icon: '⚔️', max: 100 },
    ],
    contexto: 'Contexto de prueba',
  } as any;

  describe('getChoicesForRound', () => {
    it('should return choices for apertura round', () => {
      const choices = getChoicesForRound('apertura', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Establecer contacto directo y profesional');
      expect(choices[0].effects).toHaveLength(3);
    });

    it('should return choices for investigacion round', () => {
      const choices = getChoicesForRound('investigacion', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Hacer preguntas profundas sobre dolores reales y criterios de decisión');
    });

    it('should return choices for tecnica round', () => {
      const choices = getChoicesForRound('tecnica', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Demostrar robustez arquitectónica, SLAs y garantías de migración');
    });

    it('should return choices for precio round', () => {
      const choices = getChoicesForRound('precio', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Defender precio lista sin ceder: defender valor y ROI demostrado');
    });

    it('should return choices for contraoferta round', () => {
      const choices = getChoicesForRound('contraoferta', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Recalibrar: pequeño descuento extra a cambio de firmar hoy');
    });

    it('should return choices for cierre round', () => {
      const choices = getChoicesForRound('cierre', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Proponer firma digital hoy con fecha de go-live en 30 días');
    });

    it('should return choices for alianza round', () => {
      const choices = getChoicesForRound('alianza', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Proponer Joint Business Plan: co-marketing, roadmap compartido, revenue share');
    });

    it('should return default choices for unknown round types', () => {
      const choices = getChoicesForRound('unknown', mockEscenario.stats);
      
      expect(choices).toHaveLength(3);
      expect(choices[0].label).toBe('Consolidar la relación estratégica a largo plazo');
    });
  });

  describe('getRoundDetails', () => {
    it('should return correct details for each round type', () => {
      const apertura = getRoundDetails('apertura', 'Contexto base');
      expect(apertura.title).toBe('Fase 1: Toma de Contacto y Apertura');
      expect(apertura.text.length).toBe(2);

      const investigacion = getRoundDetails('investigacion', 'Contexto base');
      expect(investigacion.title).toBe('Fase 2: Descubrimiento y Análisis');

      const tecnica = getRoundDetails('tecnica', 'Contexto base');
      expect(tecnica.title).toBe('Fase 3: Propuesta y Viabilidad');

      const precio = getRoundDetails('precio', 'Contexto base');
      expect(precio.title).toBe('Fase 4: Negociación Económica');

      const contraoferta = getRoundDetails('contraoferta', 'Contexto base');
      expect(contraoferta.title).toBe('Fase 5: Ajustes y Concesiones Tácticas');

      const cierre = getRoundDetails('cierre', 'Contexto base');
      expect(cierre.title).toBe('Fase 6: Consolidación y Cierre');

      const alianza = getRoundDetails('alianza', 'Contexto base');
      expect(alianza.title).toBe('Fase 7: Consolidación y Alianza');
    });

    it('should include context in apertura text', () => {
      const detalles = getRoundDetails('apertura', 'Mi contexto personalizado');
      expect(detalles.text[0]).toBe('Mi contexto personalizado');
      expect(detalles.text[1]).toContain('Primer intercambio formal');
    });
  });
}
)