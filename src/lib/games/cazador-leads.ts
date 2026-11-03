export type Temperatura = "hot" | "warm" | "cold";
export type EstadoLead = "nuevo" | "contactado" | "calificado" | "descartado" | "enfriado";

export interface Lead {
  id: string;
  empresa: string;
  contacto: string;
  cargo: string;
  sector: string;
  bant: { presupuesto: number; necesidad: number; autoridad: number; plazo: number };
  temperatura: Temperatura;
  paciencia: number;
  interes: number;
  estado: EstadoLead;
  senales: string[];
  resumen: string;
}

export interface DiaEvento {
  titulo: string;
  detalle: string;
  tipo: "entrada" | "perdida" | "cierre" | "nota";
}

export interface ConfigDia {
  dia: number;
  slots: number;
  titulo: string;
  llegada: string[];
  evento: string;
}

export interface ResultadoAccion {
  texto: string;
  tipo: "bueno" | "malo" | "neutro";
  lead?: Lead;
}

export interface Accion {
  id: string;
  label: string;
  hint: string;
  costeSlots: number;
  disponible: (lead: Lead) => boolean;
  ejecutar: (lead: Lead, ctx: { slots: number; dia: number }) => ResultadoAccion;
}

/* ------------------------------------------------------------------ */
/*  POOL DE EMPRESAS Y CONTACTOS                                        */
/* ------------------------------------------------------------------ */

const EMPRESAS = [
  { nombre: "Café Altura", sector: "Gastronomía", contactos: ["Valentina Ruiz · Founder"] },
  { nombre: "Taller Mecánico Sur", sector: "Automotriz", contactos: ["Cristian Palma · Dueño"] },
  { nombre: "Clínica Dental Sonrisa", sector: "Salud", contactos: ["Dra. Isabel Fuentes · Directors"] },
  { nombre: "Inmobiliaria Costa", sector: "Inmobiliario", contactos: ["Sebastián Vera · Gerente Comercial"] },
  { nombre: "Distribuidora Norte", sector: "Logística", contactos: ["Marcela Ortiz · Jefa de Compras"] },
  { nombre: "Escuela de Música Tempo", sector: "Educación", contactos: ["Felipe Arriagada · Director"] },
  { nombre: "Ferretería El Tornillo", sector: "Retail", contactos: ["Andrea Molina · Dueña"] },
  { nombre: "Agro Valle Verde", sector: "Agroindustria", contactos: ["Tomás Herrera · Gerente de Agronegocios"] },
  { nombre: "Studio Fotográfico Lumen", sector: "Creativo", contactos: ["Javiera Soto · Co-founder"] },
  { nombre: "Constructora Horizonte", sector: "Inmobiliario", contactos: ["Rodrigo Pérez · Jefe de Proyectos"] },
  { nombre: "Peluquería Charlie", sector: "Servicios", contactos: ["Camila Núñez · Dueña"] },
  { nombre: "Bodega San Pedro", sector: "Vinos", contactos: ["Matías Soto · Winemaker"] },
  { nombre: "Transporte Rápido Sur", sector: "Logística", contactos: ["Paula Cárdenas · Operations Lead"] },
  { nombre: "Studio Yoga Raíz", sector: "Bienestar", contactos: ["Daniela Godoy · Founder"] },
  { nombre: "Mecánica Express", sector: "Automotriz", contactos: ["Héctor Vega · Gerente"] },
];

const SENALES = [
  "Descartó 3 proveedores el mismo mes.",
  "Buscó soluciones con keywords en Google esta semana.",
  "Pidió referencia de clientes hace 2 días.",
  "No tiene presupuesto aprobado en este trimestre.",
  "Su CTO está en medio de cambiar de herramienta.",
  "El CEO firmó con otra agencia el año pasado.",
  "Busca integrar con su sistema contable.",
  "Crecimiento del 40% en el último trimestre.",
  "Perdió a su proveedor anterior por mala atención.",
  "El equipo está sin herramienta desde hace 3 meses.",
  "Pidió una demo pero no instaló nada.",
  "Es multitienda con 4 sucursales.",
  "Reportó caída del 15% en conversión.",
  "Tiene presupuesto pero no sabe por dónde empezar.",
];

/* ------------------------------------------------------------------ */
/*  GENERADOR (determinista por día para evitar hydration mismatch)      */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generarLead(rng: () => number, index: number): Lead {
  const emp = EMPRESAS[Math.floor(rng() * EMPRESAS.length)];
  const contacto = emp.contactos[Math.floor(rng() * emp.contactos.length)];

  const presupuesto = Math.round(20 + rng() * 80);
  const necesidad = Math.round(20 + rng() * 80);
  const autoridad = Math.round(15 + rng() * 85);
  const plazo = Math.round(15 + rng() * 85);

  const bant = { presupuesto, necesidad, autoridad, plazo };
  const score = (presupuesto + necesidad + autoridad + plazo) / 4;

  const temperatura: Temperatura = score >= 68 ? "hot" : score >= 45 ? "warm" : "cold";

  const senales: string[] = [];
  const nSen = 2 + Math.floor(rng() * 2);
  const pool = [...SENALES];
  for (let i = 0; i < nSen && pool.length; i++) {
    senales.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }

  const resumenes = [
    "Quiere ordenar su operación antes de fin de mes.",
    "Comparó tu web con la de un competidor directo.",
    "Tiene el problema claro pero no sabe por dónde partir.",
    "El equipo le pidió cotización formal esta semana.",
    "Viene de una mala experiencia con otro proveedor.",
    "Busca una solución que no le exija cambiar todo.",
  ];

  return {
    id: `lead-${index}`,
    empresa: emp.nombre,
    contacto,
    cargo: contacto.split("·")[1]?.trim() ?? "Decisor",
    sector: emp.sector,
    bant,
    temperatura,
    paciencia: 100,
    interes: temperatura === "hot" ? 35 : temperatura === "warm" ? 20 : 8,
    estado: "nuevo",
    senales,
    resumen: resumenes[Math.floor(rng() * resumenes.length)],
  };
}

/* ------------------------------------------------------------------ */
/*  CONFIGURACIÓN DEL JUEGO                                             */
/* ------------------------------------------------------------------ */

export const DIAS: ConfigDia[] = [
  {
    dia: 1,
    slots: 3,
    titulo: "Lunes — aperturas",
    llegada: ["Café Altura", "Taller Mecánico Sur", "Clínica Dental Sonrisa"],
    evento: "Tu agenda está vacía y tu meta de pipeline es de $180.000.",
  },
  {
    dia: 2,
    slots: 3,
    titulo: "Martes — el embudo se llena",
    llegada: ["Inmobiliaria Costa", "Distribuidora Norte", "Escuela de Música Tempo"],
    evento: "Los leads del lunes que no contactaste siguen ahí. Cada día sin contacto, se enfrían.",
  },
  {
    dia: 3,
    slots: 3,
    titulo: "Miércoles — presión",
    llegada: ["Ferretería El Tornillo", "Agro Valle Verde", "Studio Fotográfico Lumen"],
    evento: "Tu gerente pregunta por el pipeline. Muestra resultados, no actividad.",
  },
  {
    dia: 4,
    slots: 4,
    titulo: "Jueves — hora de la verdad",
    llegada: ["Constructora Horizonte", "Peluquería Charlie", "Bodega San Pedro"],
    evento: "Últimas 48 horas. Los leads calientes que no atiendas hoy se pierden.",
  },
  {
    dia: 5,
    slots: 4,
    titulo: "Viernes — cierre del trimestre",
    llegada: ["Transporte Rápido Sur", "Studio Yoga Raíz", "Mecánica Express"],
    evento: "Último día. Al cerrar, se calcula tu pipeline y tu ranking.",
  },
];

export const META_PIPELINE = 180000;

export function calcularValorPipeline(leads: Lead[]): number {
  return leads
    .filter((l) => l.estado === "calificado" || l.estado === "contactado")
    .reduce((acc, l) => {
      const bantPromedio =
        (l.bant.presupuesto + l.bant.necesidad + l.bant.autoridad + l.bant.plazo) / 400;
      const interes = l.interes / 100;
      const valor = l.bant.presupuesto * 2200 * bantPromedio * (0.5 + interes * 0.9);
      return acc + valor;
    }, 0);
}

/* ------------------------------------------------------------------ */
/*  ACCIONES DEL JUGADOR                                                */
/* ------------------------------------------------------------------ */

export const ACCIONES: Accion[] = [
  {
    id: "llamar",
    label: "Llamar ahora",
    hint: "Contacto directo. Máximo impacto si tienes autoridad real.",
    costeSlots: 1,
    disponible: (l) => l.estado === "nuevo" || l.estado === "contactado",
    ejecutar: (lead) => {
      const b = lead.bant;
      if (b.autoridad >= 55) {
        const inter = Math.min(100, lead.interes + 32);
        return {
          texto: `Atendiste a ${lead.contacto.split("·")[0].trim()}. Habló claro: el problema es real y quiere avanzar.`,
          tipo: "bueno",
          lead: {
            ...lead,
            interes: inter,
            estado: "calificado",
            paciencia: Math.max(lead.paciencia, 70),
            temperatura: inter > 60 ? "hot" : lead.temperatura,
          },
        };
      }
      return {
        texto: `Llamaste a ${lead.contacto.split("·")[0].trim()}, pero no es quien decide. Te derivó a otra persona… y perdiste el día.`,
        tipo: "malo",
        lead: { ...lead, estado: "contactado", interes: Math.max(0, lead.interes - 8), paciencia: lead.paciencia - 18 },
      };
    },
  },
  {
    id: "email",
    label: "Calificar por email",
    hint: "Lento y seguro. Descubre dolor y presupuesto sin quemar el contacto.",
    costeSlots: 1,
    disponible: (l) => l.estado === "nuevo" || l.estado === "contactado",
    ejecutar: (lead) => {
      const b = lead.bant;
      const solido = b.presupuesto >= 50 && b.necesidad >= 50;
      return {
        texto: solido
          ? `Respondieron con números concretos: presupuesto confirmado y problema urgentísimo. Ahora sabes a quién llamar.`
          : `Respondieron con evasivas: \"ya lo revisamos\". Sin señales claras de presupuesto ni urgencia.`,
        tipo: solido ? "bueno" : "neutro",
        lead: {
          ...lead,
          estado: "contactado",
          interes: solido ? Math.min(100, lead.interes + 18) : lead.interes,
          paciencia: lead.paciencia + 10,
        },
      };
    },
  },
  {
    id: "propuesta",
    label: "Enviar propuesta",
    hint: "Avanza rápido, pero si el timing es malo, se pierde.",
    costeSlots: 1,
    disponible: (l) => l.estado === "contactado" || l.estado === "calificado",
    ejecutar: (lead) => {
      const b = lead.bant;
      if (b.necesidad >= 55 && b.plazo >= 45) {
        return {
          texto: `Propuesta enviada y ACEPTADA. ${lead.empresa} entra al pipeline formal.`,
          tipo: "bueno",
          lead: { ...lead, estado: "calificado", interes: Math.min(100, lead.interes + 40) },
        };
      }
      return {
        texto: `Mandaste la propuesta a ${lead.empresa}. Silencio. El timing no era el correcto y la perdiste.`,
        tipo: "malo",
        lead: { ...lead, estado: "enfriado", paciencia: 0 },
      };
    },
  },
  {
    id: "descartar",
    label: "Descartar",
    hint: "Libera tu agenda. Pero ese pipeline no lo va a comprar nadie.",
    costeSlots: 0,
    disponible: (l) => l.estado === "nuevo" || l.estado === "contactado",
    ejecutar: (lead) => ({
      texto: `Descartaste a ${lead.empresa}. Tu agenda está libre… y ese cliente se lo lleva otro.`,
      tipo: "neutro",
      lead: { ...lead, estado: "descartado" },
    }),
  },
];
