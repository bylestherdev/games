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

export interface AccionDef {
  id: string;
  label: string;
  hint: string;
  costeSlots: number;
}

export interface FinalLead {
  id: string;
  rank: "S" | "A" | "B" | "C" | "D";
  title: string;
  text: string;
  condicion?: { pipelineMin?: number; calificadosMin?: number };
}

export interface LeadGameData {
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  category: string;
  difficulty: 1 | 2 | 3;
  minutes: number;
  description: string;
  accent: string;
  imagen?: string;
  escenarioInicial: string;
  escenarios: Array<{
    id: string;
    titulo: string;
    etiqueta: string;
    contexto: string;
    metaPipeline: number;
    dias: ConfigDia[];
  }>;
  acciones: AccionDef[];
  finales: FinalLead[];
}

export const EMPRESAS = [
  { nombre: "Café Altura", sector: "Gastronomía", contactos: ["Valentina Ruiz · Founder"] },
  { nombre: "Taller Mecánico Sur", sector: "Automotriz", contactos: ["Cristian Palma · Dueño"] },
  { nombre: "Clínica Dental Sonrisa", sector: "Salud", contactos: ["Dra. Isabel Fuentes · Directora"] },
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

const RESUMENES = [
  "Quiere ordenar su operación antes de fin de mes.",
  "Comparó tu web con la de un competidor directo.",
  "Tiene el problema claro pero no sabe por dónde partir.",
  "El equipo le pidió cotización formal esta semana.",
  "Viene de una mala experiencia con otro proveedor.",
  "Busca una solución que no le exija cambiar todo.",
];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTexto(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generarLead(rng: () => number, empresaNombre: string, index: number): Lead {
  const emp = EMPRESAS.find((e) => e.nombre === empresaNombre) ?? EMPRESAS[0];
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
    resumen: RESUMENES[Math.floor(rng() * RESUMENES.length)],
  };
}

export function generarLeadsDia(dia: ConfigDia, escenarioId: string): Lead[] {
  const rng = mulberry32(hashTexto(`${escenarioId}:${dia.dia}`));
  return dia.llegada.map((empresa, i) => generarLead(rng, empresa, dia.dia * 10 + i));
}

export const ESCENARIO_SEMANA = {
  id: "semana-1",
  titulo: "Semana 1 — Primer mes",
  etiqueta: "Caso Clásico",
  contexto:
    "Tu primer mes como vendedor. El pipeline está vacío y la gerencia espera números, no actividad. Tres leads llegan cada mañana y tu agenda solo alcanza para algunos.",
  metaPipeline: 180000,
  dias: [
    {
      dia: 1,
      slots: 3,
      titulo: "Lunes — aperturas",
      llegada: ["Café Altura", "Taller Mecánico Sur", "Clínica Dental Sonrisa"],
      evento: "Tu agenda está vacía y tu meta de pipeline es de $180.000. Tres empresas en tu embudo y tres horas de trabajo: una para cada una.",
    },
    {
      dia: 2,
      slots: 3,
      titulo: "Martes — el embudo se llena",
      llegada: ["Inmobiliaria Costa", "Distribuidora Norte", "Escuela de Música Tempo"],
      evento: "Los leads del lunes que no contactaste siguen ahí, pero cada día sin contacto se enfrían. Hoy llegan tres más.",
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
      evento: "Últimas 48 horas para el cierre de mes. Los leads calientes que no atiendas hoy se pierden.",
    },
    {
      dia: 5,
      slots: 4,
      titulo: "Viernes — cierre del trimestre",
      llegada: ["Transporte Rápido Sur", "Studio Yoga Raíz", "Mecánica Express"],
      evento: "Último día. Al cerrar la jornada se calcula tu pipeline y tu ranking.",
    },
  ],
};

export const ESCENARIO_VERANO = {
  id: "verano",
  titulo: "Campaña de Verano (Alta Intensidad)",
  etiqueta: "Modo Difícil",
  contexto:
    "Temporada alta. 4 leads diarios, menor paciencia de los decisores y una meta de $280.000 de pipeline. Cada minuto cuenta.",
  metaPipeline: 280000,
  dias: [
    {
      dia: 1,
      slots: 3,
      titulo: "Lunes — avalancha",
      llegada: ["Bodega San Pedro", "Inmobiliaria Costa", "Studio Fotográfico Lumen", "Café Altura"],
      evento: "Entran 4 leads de golpe el lunes. Tu agenda de 3 slots te obliga a elegir con pinzas.",
    },
    {
      dia: 2,
      slots: 3,
      titulo: "Martes — filtrando ruido",
      llegada: ["Taller Mecánico Sur", "Distribuidora Norte", "Escuela de Música Tempo", "Peluquería Charlie"],
      evento: "Los decisores están de vacaciones parciales. El tiempo de respuesta es clave.",
    },
    {
      dia: 3,
      slots: 4,
      titulo: "Miércoles — aceleración",
      llegada: ["Constructora Horizonte", "Agro Valle Verde", "Clínica Dental Sonrisa", "Transporte Rápido Sur"],
      evento: "Media semana. El director comercial exige ver propuestas firmadas.",
    },
    {
      dia: 4,
      slots: 4,
      titulo: "Jueves — el filtro BANT",
      llegada: ["Ferretería El Tornillo", "Studio Yoga Raíz", "Mecánica Express", "Bodega San Pedro"],
      evento: "Muchos curiosos con cero presupuesto. Separa el oro de la paja.",
    },
    {
      dia: 5,
      slots: 5,
      titulo: "Viernes — gran cierre",
      llegada: ["Inmobiliaria Costa", "Constructora Horizonte", "Distribuidora Norte", "Agro Valle Verde"],
      evento: "Última oportunidad para calificar y meter contratos al pipeline.",
    },
  ],
};

export const ACCIONES: AccionDef[] = [
  { id: "llamar", label: "Llamar ahora", hint: "Contacto directo. Máximo impacto si el lead tiene autoridad real.", costeSlots: 1 },
  { id: "email", label: "Calificar por email", hint: "Lento y seguro. Descubre dolor y presupuesto sin quemar el contacto.", costeSlots: 1 },
  { id: "propuesta", label: "Enviar propuesta", hint: "Avanza rápido, pero si el timing es malo, se pierde.", costeSlots: 1 },
  { id: "descartar", label: "Descartar", hint: "Libera tu agenda. Pero ese pipeline no lo va a comprar nadie.", costeSlots: 0 },
];

export function ejecutarAccionLead(lead: Lead, accionId: string): ResultadoAccion {
  const nombreContacto = lead.contacto.split("·")[0].trim();
  const b = lead.bant;

  if (accionId === "llamar") {
    if (b.autoridad >= 55) {
      const inter = Math.min(100, lead.interes + 32);
      return {
        texto: `Atendiste a ${nombreContacto}. Habló claro: el problema es real y quiere avanzar.`,
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
      texto: `Llamaste a ${nombreContacto}, pero no es quien decide. Te derivó a otra persona… y perdiste la hora.`,
      tipo: "malo",
      lead: {
        ...lead,
        estado: "contactado",
        interes: Math.max(0, lead.interes - 8),
        paciencia: Math.max(0, lead.paciencia - 18),
      },
    };
  }

  if (accionId === "email") {
    const solido = b.presupuesto >= 50 && b.necesidad >= 50;
    return {
      texto: solido
        ? "Respondieron con números concretos: presupuesto confirmado y problema urgentísimo. Ahora sabes a quién llamar."
        : 'Respondieron con evasivas: "ya lo revisamos". Sin señales claras de presupuesto ni urgencia.',
      tipo: solido ? "bueno" : "neutro",
      lead: {
        ...lead,
        estado: "contactado",
        interes: solido ? Math.min(100, lead.interes + 18) : lead.interes,
        paciencia: Math.min(100, lead.paciencia + 10),
      },
    };
  }

  if (accionId === "propuesta") {
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
  }

  // descartar
  return {
    texto: `Descartaste a ${lead.empresa}. Tu agenda está libre… y ese cliente se lo lleva otro.`,
    tipo: "neutro",
    lead: { ...lead, estado: "descartado" },
  };
}

export function accionDisponible(lead: Lead, accionId: string): boolean {
  if (accionId === "descartar" || accionId === "llamar" || accionId === "email") {
    return lead.estado === "nuevo" || lead.estado === "contactado";
  }
  if (accionId === "propuesta") {
    return lead.estado === "contactado" || lead.estado === "calificado";
  }
  return false;
}

export const FINALES: FinalLead[] = [
  {
    id: "oro",
    rank: "S",
    title: "Cazador de oro",
    text: "No perseguiste todo: perseguiste los que podían comprar. Pipeline por encima de la meta, varios clientes calificados y cero tiempo quemado en gente que nunca iba a firmar. Tu gerente deja de preguntar por el embudo y empieza a preguntar cómo lo lograste.",
    condicion: { pipelineMin: 260000, calificadosMin: 5 },
  },
  {
    id: "solido",
    rank: "A",
    title: "Pipeline sólido",
    text: "Llegaste a la meta con una cartera sana. No todos los leads firmaron, pero los que tocaste estaban bien trabajados. La diferencia entre tener suerte y saber priorizar se nota justo en el cierre de mes.",
    condicion: { pipelineMin: 180000 },
  },
  {
    id: "justo",
    rank: "B",
    title: "Alcanzaste justos",
    text: "Llegaste raspando. Algunos leads se enfriaron en tu bandeja y otros quedaron a medio camino: interés sin cierre. El número no está mal, pero el próximo trimestre empieza desde cero porque este pipeline no se renueva solo.",
    condicion: { pipelineMin: 90000 },
  },
  {
    id: "frail",
    rank: "C",
    title: "Semana de aprendices",
    text: "Trabajaste mucho y cerraste poco. La agenda se llenó de conversaciones que nunca llegaron a una propuesta, y los leads que de verdad querían comprar se enfriaron esperándote. La próxima semana empieza con cero pipeline y la misma lección.",
    condicion: { pipelineMin: 40000 },
  },
  {
    id: "cero",
    rank: "D",
    title: "Cero pipeline",
    text: "Un mes de llamadas, emails y agendas llenas. Ninguna propuesta firmada. El problema no fue la cantidad de trabajo, sino a quién le diste tu tiempo: cada lead descartado era un cliente que alguien más iba a atender.",
  },
];

export const cazadorLeads: LeadGameData = {
  slug: "cazador-leads",
  title: "Cazador de Leads",
  tagline: "Cinco días. Múltiples leads. Una sola agenda.",
  icon: "🎯",
  category: "Prospección",
  difficulty: 2,
  minutes: 10,
  description:
    "Simulador de prospección comercial B2B. Califica con BANT, optimiza tu embudo de ventas y alcanza la meta de pipeline.",
  accent: "#D946EF",
  imagen: "/img/cazador-leads.jpg",
  escenarioInicial: "semana-1",
  escenarios: [ESCENARIO_SEMANA, ESCENARIO_VERANO],
  acciones: ACCIONES,
  finales: FINALES,
};

export function calcularValorPipeline(leads: Lead[]): number {
  return leads
    .filter((l) => l.estado === "calificado")
    .reduce((acc, l) => {
      const bantPromedio =
        (l.bant.presupuesto + l.bant.necesidad + l.bant.autoridad + l.bant.plazo) / 400;
      const interes = l.interes / 100;
      const valor = l.bant.presupuesto * 2200 * bantPromedio * (0.5 + interes * 0.9);
      return acc + valor;
    }, 0);
}

export function contarCalificados(leads: Lead[]): number {
  return leads.filter((l) => l.estado === "calificado").length;
}

export function enfriarLeads(leads: Lead[]): Lead[] {
  return leads.map((l) => {
    if (l.estado !== "nuevo" && l.estado !== "contactado") return l;
    const paciencia = l.paciencia - 18;
    const interes = Math.max(0, l.interes - 6);
    if (paciencia <= 0) {
      return { ...l, paciencia: 0, interes, estado: "enfriado" as const };
    }
    return { ...l, paciencia, interes };
  });
}

export function resolverFinal(
  finales: FinalLead[],
  leads: Lead[],
  pipeline: number
): FinalLead {
  const calificados = contarCalificados(leads);
  for (const f of finales) {
    if (!f.condicion) return f;
    if (f.condicion.pipelineMin !== undefined && pipeline < f.condicion.pipelineMin) continue;
    if (f.condicion.calificadosMin !== undefined && calificados < f.condicion.calificadosMin) continue;
    return f;
  }
  return finales[finales.length - 1];
}
