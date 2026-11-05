export type Temperatura = "hot" | "warm" | "cold";
export type EstadoLead = "nuevo" | "contactado" | "calificado" | "descartado" | "enfriado" | "propuesta_enviada" | "negociando";
export type TipoAccion = "llamada" | "email" | "linkedin" | "demo" | "propuesta" | "seguimiento" | "descartar" | "reunión";

export interface Lead {
  id: string;
  empresa: string;
  contacto: string;
  cargo: string;
  sector: string;
  tamaño: "startup" | "pyme" | "enterprise";
  bant: { presupuesto: number; necesidad: number; autoridad: number; plazo: number };
  temperatura: Temperatura;
  paciencia: number;
  interes: number;
  estado: EstadoLead;
  senales: string[];
  resumen: string;
  competidorActual?: string;
  probabilidadCierre: number;
  valorEstimado: number;
  ultimaInteraccion: number;
  notas: string[];
  fuente: "inbound" | "outbound" | "referido" | "evento";
}

export interface ConfigDia {
  dia: number;
  slots: number;
  titulo: string;
  llegada: string[];
  evento: string;
  eventoOpcional?: {
    texto: string;
    opciones: { label: string; efecto: (lead: Lead) => Lead }[];
  };
}

export interface ResultadoAccion {
  texto: string;
  tipo: "excelente" | "bueno" | "neutro" | "malo" | "critico";
  lead?: Lead;
  pipelineGenerado?: number;
}

export interface AccionDef {
  id: TipoAccion;
  label: string;
  hint: string;
  costeSlots: number;
  requiereEstado?: EstadoLead[];
  icono: string;
}

export interface FinalLead {
  id: string;
  rank: "S" | "A" | "B" | "C" | "D";
  title: string;
  text: string;
  condicion?: { pipelineMin?: number; calificadosMin?: number; ticketMedioMin?: number };
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

const SECTORES = [
  { nombre: "SaaS B2B", empresas: ["TechFlow", "DataMind", "CloudSync", "AutoScale", "DevBridge"] },
  { nombre: "Fintech", empresas: ["PayFlow", "CreditSmart", "InvestHub", "PayGuard", "CoinTrack"] },
  { nombre: "E-commerce", empresas: ["ShopMax", "CartFlow", "ShipFast", "ReturnEasy", "LoyaltyPlus"] },
  { nombre: "HealthTech", empresas: ["MediConnect", "HealthSync", "TeleCare", "PharmaTrack", "WellnessHub"] },
  { nombre: "EdTech", empresas: ["LearnFlow", "SkillBridge", "CertifyMe", "TutorMatch", "CampusDigital"] },
  { nombre: "Logística", empresas: ["ShipSmart", "RouteOpt", "WarehousePro", "LastMile", "FleetTrack"] },
  { nombre: "Marketing", empresas: ["AdOptimize", "ContentFlow", "SEORank", "SocialPulse", "EmailCraft"] },
  { nombre: "RRHH", empresas: ["TalentFlow", "HireSmart", "PayrollPro", "BenefitsPlus", "CultureTrack"] },
];

const CARGOS = [
  { cargo: "CEO / Founder", autoridad: 90, peso: 0.15 },
  { cargo: "CTO / VP Engineering", autoridad: 80, peso: 0.15 },
  { cargo: "VP Operaciones / COO", autoridad: 85, peso: 0.1 },
  { cargo: "Director Comercial / VP Sales", autoridad: 75, peso: 0.15 },
  { cargo: "Director Marketing / CMO", autoridad: 70, peso: 0.1 },
  { cargo: "Head of Product", autoridad: 65, peso: 0.1 },
  { cargo: "Gerente de Compras / Procurement", autoridad: 60, peso: 0.1 },
  { cargo: "IT Manager / SysAdmin", autoridad: 40, peso: 0.15 },
];

const NOMBRES = [
  "Alejandro", "María", "Carlos", "Laura", "Javier", "Patricia", "Andrés", "Claudia",
  "Roberto", "Isabel", "Fernando", "Lucía", "Diego", "Carmen", "Pablo", "Ana",
  "Miguel", "Sofía", "Jorge", "Elena", "Ricardo", "Paula", "Alberto", "Marta",
];

const APELLIDOS = [
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez",
  "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno",
  "Álvarez", "Romero", "Alonso", "Gutiérrez", "Navarro", "Torres", "Domínguez",
];

const SENALES_COMPRADOR = [
  { texto: "Visitó la página de precios 3 veces esta semana", peso: 15, tipo: "intencion" },
  { texto: "Descargó el whitepaper técnico", peso: 10, tipo: "educacion" },
  { texto: "Solicitó demo hace 2 días", peso: 20, tipo: "accion" },
  { texto: "Comentó en post de LinkedIn sobre el problema", peso: 8, tipo: "engagement" },
  { texto: "Abrió 5 emails de nurturing seguidos", peso: 12, tipo: "engagement" },
  { texto: "Su competidor acaba de implementar nuestra solución", peso: 25, tipo: "urgencia" },
  { texto: "Nuevo VP de Operaciones contratado hace 30 días", peso: 18, tipo: "cambio" },
  { texto: "Anunció ronda de financiación Serie B", peso: 22, tipo: "presupuesto" },
  { texto: "Publicó oferta de empleo para el rol que usa nuestra herramienta", peso: 15, tipo: "crecimiento" },
  { texto: "Su contrato con competidor vence en 90 días", peso: 30, tipo: "ventana" },
];

const SENALES_RIESGO = [
  { texto: "No tiene presupuesto aprobado este trimestre", peso: -20, tipo: "presupuesto" },
  { texto: "Su CTO está en medio de migración técnica", peso: -15, tipo: "tecnico" },
  { texto: "El CEO firmó con competidor el año pasado", peso: -25, tipo: "lealtad" },
  { texto: "Pidió demo pero no instaló nada en 14 días", peso: -10, tipo: "engagement" },
  { texto: "Es multitienda con 4 sucursales y procesos distintos", peso: -12, tipo: "complejidad" },
  { texto: "Reportó caída del 15% en conversión web", peso: -8, tipo: "rendimiento" },
  { texto: "Tiene presupuesto pero no sabe por dónde empezar", peso: -5, tipo: "claridad" },
  { texto: "Su equipo está sin herramienta desde hace 3 meses", peso: 10, tipo: "urgencia" },
];

const RESUMENES = [
  "Quiere ordenar su operación antes de fin de mes.",
  "Comparó tu web con la de un competidor directo esta semana.",
  "Tiene el problema claro pero no sabe por dónde partir.",
  "El equipo le pidió cotización formal hace 3 días.",
  "Viene de una mala experiencia con otro proveedor.",
  "Busca una solución que no le exija cambiar todo su stack.",
  "Necesita demostrar ROI a su board antes del Q2.",
  "Quiere reducir costes operativos un 20% este año.",
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

function aleatorio(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nombreAleatorio() {
  return `${aleatorio(NOMBRES)} ${aleatorio(APELLIDOS)}`;
}

function generarSectorYEmpresa(rng: () => number) {
  const sector = aleatorio(SECTORES);
  const empresa = aleatorio(sector.empresas);
  return { sector: sector.nombre, empresa };
}

function generarCargo(rng: () => number) {
  const rand = rng();
  let acc = 0;
  for (const c of CARGOS) {
    acc += c.peso;
    if (rand < acc) return c;
  }
  return CARGOS[0];
}

function calcularValorEstimado(bant: any, tamaño: string, temperatura: Temperatura): number {
  const base = (bant.presupuesto + bant.necesidad + bant.autoridad + bant.plazo) / 4;
  const multTamaño = tamaño === "enterprise" ? 3.5 : tamaño === "pyme" ? 1.8 : 1.0;
  const multTemp = temperatura === "hot" ? 1.5 : temperatura === "warm" ? 1.0 : 0.6;
  return Math.round(base * multTamaño * multTemp * 2500);
}

export function generarLead(rng: () => number, empresaNombre: string, index: number, escenarioId: string): Lead {
  const { sector, empresa } = generarSectorYEmpresa(rng);
  const cargoInfo = generarCargo(rng);
  const cargo = cargoInfo.cargo;
  const autoridadBase = cargoInfo.autoridad;

  const presupuesto = Math.round(20 + rng() * 80);
  const necesidad = Math.round(25 + rng() * 75);
  const autoridad = Math.min(100, Math.round(autoridadBase + (rng() - 0.5) * 20));
  const plazo = Math.round(20 + rng() * 80);

  const bant = { presupuesto, necesidad, autoridad, plazo };
  const score = (presupuesto + necesidad + autoridad + plazo) / 4;

  const temperatura: Temperatura = score >= 70 ? "hot" : score >= 48 ? "warm" : "cold";

  const tamaño: "startup" | "pyme" | "enterprise" = 
    rng() < 0.2 ? "enterprise" : rng() < 0.5 ? "pyme" : "startup";

  const senales: string[] = [];
  const nSenPos = 1 + Math.floor(rng() * 3);
  const nSenNeg = Math.floor(rng() * 2);
  const poolPos = [...SENALES_COMPRADOR];
  const poolNeg = [...SENALES_RIESGO];

  for (let i = 0; i < nSenPos && poolPos.length; i++) {
    const s = poolPos.splice(Math.floor(rng() * poolPos.length), 1)[0];
    senales.push(s.texto);
  }
  for (let i = 0; i < nSenNeg && poolNeg.length; i++) {
    const s = poolNeg.splice(Math.floor(rng() * poolNeg.length), 1)[0];
    senales.push(s.texto);
  }

  const valorEstimado = calcularValorEstimado(bant, tamaño, temperatura);
  const probabilidadCierre = Math.round((score / 100) * (temperatura === "hot" ? 0.7 : temperatura === "warm" ? 0.4 : 0.15) * 100);

  const fuentes: Lead["fuente"][] = ["inbound", "outbound", "referido", "evento"];
  const fuente = aleatorio(fuentes);

  return {
    id: `lead-${escenarioId}-${index}`,
    empresa,
    contacto: nombreAleatorio(),
    cargo,
    sector,
    tamaño,
    bant: { presupuesto, necesidad, autoridad, plazo },
    temperatura,
    paciencia: temperatura === "hot" ? 80 : temperatura === "warm" ? 60 : 40,
    interes: temperatura === "hot" ? 40 : temperatura === "warm" ? 25 : 10,
    estado: "nuevo",
    senales,
    resumen: aleatorio(RESUMENES),
    competidorActual: rng() < 0.3 ? aleatorio(["CompetidorA", "CompetidorB", "CompetidorC", "Solución Interna"]) : undefined,
    probabilidadCierre,
    valorEstimado,
    ultimaInteraccion: 0,
    notas: [],
    fuente,
  };
}

export function generarLeadsDia(dia: ConfigDia, escenarioId: string): Lead[] {
  const rng = mulberry32(hashTexto(`${escenarioId}:${dia.dia}`));
  return dia.llegada.map((empresa, i) => generarLead(rng, empresa, dia.dia * 10 + i, escenarioId));
}

export const ESCENARIO_SEMANA = {
  id: "semana-1",
  titulo: "Semana 1: Primer Mes en el Terreno",
  etiqueta: "Onboarding Comercial",
  contexto:
    "Es tu primer mes como Account Executive. El pipeline está a cero y tu manager espera $180K de pipeline calificado al viernes. Cada día llegan leads nuevos, tus slots de agenda son limitados y cada lead que se enfría es dinero que deja la mesa. Prioriza, califica y cierra.",
  metaPipeline: 180000,
  dias: [
    {
      dia: 1,
      slots: 3,
      titulo: "Lunes — Primer Contacto",
      llegada: ["TechFlow", "PayFlow", "ShopMax"],
      evento: "Pipeline: $0. Meta semanal: $180K. Tres leads fríos en bandeja. Tu agenda tiene 3 slots. Elige bien: cada hora cuenta.",
    },
    {
      dia: 2,
      slots: 3,
      titulo: "Martes — El Embudo se Llena",
      llegada: ["MediConnect", "LearnFlow", "ShipSmart"],
      evento: "Los leads del lunes que no tocaste han perdido 15% de interés. Hoy llegan 3 nuevos. Pipeline actual: revisa el dashboard.",
    },
    {
      dia: 3,
      slots: 3,
      titulo: "Miércoles — Presión Media Semana",
      llegada: ["AdOptimize", "TalentFlow", "DataMind"],
      evento: "Tu manager pide visibilidad de pipeline en la daily. 'Necesito ver $60K calificados para el jueves'. No hay excusas.",
    },
    {
      dia: 4,
      slots: 4,
      titulo: "Jueves — Hora de la Verdad",
      llegada: ["CloudSync", "AutoScale", "CreditSmart", "ShipFast"],
      evento: "Últimas 48h para meter pipeline al mes. Los leads calientes que no cierres hoy se enfrían irreversiblemente.",
    },
    {
      dia: 5,
      slots: 4,
      titulo: "Viernes — Cierre de Semana",
      llegada: ["InvestHub", "DevBridge", "PayGuard", "CertifyMe"],
      evento: "Cierre de semana. Se calcula tu pipeline, ticket medio, tasa de calificación y ranking. ¿Cumpliste?",
    },
  ],
};

export const ESCENARIO_VERANO = {
  id: "verano",
  titulo: "Campaña Verano: Alta Velocidad",
  etiqueta: "Temporada Alta",
  contexto:
    "Temporada alta. 4-5 leads diarios, decisores con agenda reducida, meta de $280K pipeline. La competencia está agresiva. Cada minuto de indecisión cuesta dinero. Velocidad y precisión son tu única ventaja.",
  metaPipeline: 280000,
  dias: [
    {
      dia: 1,
      slots: 3,
      titulo: "Lunes — Avalancha",
      llegada: ["AutoScale", "InvestHub", "DevBridge", "PayGuard"],
      evento: "4 leads entran a la vez el lunes. Solo 3 slots. Prioriza por valor estimado y temperatura. Los que dejes fuera se enfrían.",
    },
    {
      dia: 2,
      slots: 3,
      titulo: "Martes — Filtrando Ruido",
      llegada: ["CertifyMe", "DataMind", "AutoScale", "ShopMax"],
      evento: "Muchos decisores en 'modo vacaciones'. Respuesta lenta = lead muerto. Filtra agresivamente: solo invierte en los que pueden cerrar.",
    },
    {
      dia: 3,
      slots: 4,
      titulo: "Miércoles — Aceleración",
      llegada: ["PayFlow", "ShopMax", "MediConnect", "LearnFlow"],
      evento: "Media semana. El director comercial quiere ver propuestas firmadas, no 'conversaciones'. Acelera los que tienen autoridad real.",
    },
    {
      dia: 4,
      slots: 4,
      titulo: "Jueves — Filtro BANT Riguroso",
      llegada: ["CloudSync", "AutoScale", "CreditSmart", "ShipFast"],
      evento: "Muchos curiosos con presupuesto cero. Separa el oro de la paja. Cada slot en un lead sin presupuesto es dinero quemado.",
    },
    {
      dia: 5,
      slots: 5,
      titulo: "Viernes — Gran Cierre",
      llegada: ["InvestHub", "DataMind", "AdOptimize", "TalentFlow"],
      evento: "Último día del sprint. Última oportunidad para calificar, enviar propuestas y meter contratos al pipeline. Cierra la semana fuerte.",
    },
  ],
};

export const ESCENARIO_ENTERPRISE = {
  id: "enterprise",
  titulo: "Cuenta Enterprise: Ciclo Largo",
  etiqueta: "Venta Compleja",
  contexto:
    "Te asignan la vertical Enterprise. Ciclos de 90-180 días, comités de 5-8 decisores, budgets >$100K. No hay 'cierres rápidos' aquí: hay arquitectura de cuenta, mapping de stakeholders, business cases y navegación política. Meta: $500K pipeline en 4 semanas.",
  metaPipeline: 500000,
  dias: [
    {
      dia: 1,
      slots: 2,
      titulo: "Lunes — Mapping Inicial",
      llegada: ["GlobalCorp", "MegaTech"],
      evento: "2 cuentas enterprise. Necesitas mappear: ¿Quién firma? ¿Quién influye? ¿Quién bloquea? Tu CRM está vacío. Empieza a rellenarlo.",
    },
    {
      dia: 2,
      slots: 3,
      titulo: "Martes — Primer Contacto",
      llegada: ["DataSystems", "GlobalCorp"],
      evento: "GlobalCorp responde: su CTO quiere call técnico. Prepara a tu SE. El champion interno es clave para abrir puertas.",
    },
    {
      dia: 3,
      slots: 3,
      titulo: "Miércoles — Discovery Profundo",
      llegada: ["TechGlobal", "DataSystems"],
      evento: "Discovery call con DataSystems. Su CFO está en la llamada. Pregunta por ROI a 12 meses. Ten tu business case listo.",
    },
    {
      dia: 4,
      slots: 4,
      titulo: "Jueves — Navegación Política",
      llegada: ["MegaCorp", "TechGlobal"],
      evento: "MegaCorp: el VP Engineering ama tu tech, el CFO quiere descuento 30%, el CISO bloquea por compliance. Mapea, alinea, avanza.",
    },
    {
      dia: 5,
      slots: 4,
      titulo: "Viernes — Pipeline Review",
      llegada: ["GlobalCorp", "MegaCorp"],
      evento: "Pipeline review con tu manager. Enterprise no se cierra en una semana, pero el pipeline debe reflejar avances reales: champions, business cases, next steps fechados.",
    },
  ],
};

export const ACCIONES: AccionDef[] = [
  {
    id: "llamada",
    label: "Llamada telefónica",
    hint: "Contacto directo. Alto impacto si alcanzas al decisor. Quema 1 slot.",
    costeSlots: 1,
    icono: "📞",
    requiereEstado: ["nuevo", "contactado"],
  },
  {
    id: "email",
    label: "Email personalizado",
    hint: "Escalable y documentado. Descubre dolor y presupuesto sin presión. 1 slot.",
    costeSlots: 1,
    icono: "📧",
    requiereEstado: ["nuevo", "contactado"],
  },
  {
    id: "linkedin",
    label: "Conexión LinkedIn + mensaje",
    hint: "Bajo coste, calienta la relación. Ideal para calentar antes de llamar. 0.5 slots.",
    costeSlots: 0.5,
    icono: "🔗",
    requiereEstado: ["nuevo"],
  },
  {
    id: "demo",
    label: "Demo técnica / Discovery call",
    hint: "Alto impacto si hay necesidad real. Requiere preparación. 2 slots.",
    costeSlots: 2,
    icono: "🖥️",
    requiereEstado: ["contactado", "calificado"],
  },
  {
    id: "propuesta",
    label: "Enviar propuesta formal",
    hint: "Paso decisivo. Solo si hay BANT validado y timing correcto. 1 slot.",
    costeSlots: 1,
    icono: "📄",
    requiereEstado: ["calificado", "propuesta_enviada", "negociando"],
  },
  {
    id: "seguimiento",
    label: "Seguimiento / Nurturing",
    hint: "Mantiene caliente sin presión. Recupera leads enfriados. 0.5 slots.",
    costeSlots: 0.5,
    icono: "🔄",
    requiereEstado: ["contactado", "calificado", "propuesta_enviada", "enfriado", "negociando"],
  },
  {
    id: "reunión",
    label: "Reunión presencial / Ejecutiva",
    hint: "Alto coste, alto retorno. Para cerrar enterprise o desbloquear. 3 slots.",
    costeSlots: 3,
    icono: "🤝",
    requiereEstado: ["negociando", "propuesta_enviada"],
  },
  {
    id: "descartar",
    label: "Descartar lead",
    hint: "Libera agenda. Sin coste de slots. Pierdes valor potencial.",
    costeSlots: 0,
    icono: "🗑️",
    requiereEstado: ["nuevo", "contactado", "enfriado"],
  },
];

function calcularEfectosBANT(lead: Lead, accionId: TipoAccion): Partial<Lead> {
  const b = lead.bant;
  const nuevaInteres = Math.min(100, lead.interes + (accionId === "demo" ? 20 : accionId === "llamada" ? 15 : 10));
  const nuevaPaciencia = Math.min(100, lead.paciencia + (accionId === "seguimiento" ? 15 : 5));
  const probabilidadBase = (b.presupuesto + b.necesidad + b.autoridad + b.plazo) / 400;
  const multTemp = lead.temperatura === "hot" ? 1.2 : lead.temperatura === "warm" ? 1.0 : 0.7;
  const probCierre = Math.round(probabilidadBase * multTemp * 100);

  return {
    interes: nuevaInteres,
    paciencia: nuevaPaciencia,
    probabilidadCierre: Math.min(95, probCierre),
    ultimaInteraccion: Date.now(),
  };
}

export function ejecutarAccionLead(lead: Lead, accionId: TipoAccion): ResultadoAccion {
  const nombreContacto = lead.contacto.split(" ")[0];
  const b = lead.bant;
  const accion = ACCIONES.find(a => a.id === accionId)!;

  // Utilidad: calcular probabilidad base de éxito basada en BANT
  const calcularProbabilidadExito = (lead: Lead, accionId: TipoAccion): number => {
    const b = lead.bant;
    const scoreBANT = (b.presupuesto + b.necesidad + b.autoridad + b.plazo) / 400; // 0-1
    const multTemp = lead.temperatura === "hot" ? 1.3 : lead.temperatura === "warm" ? 1.0 : 0.6;
    
    // Factores por acción
    const factoresAccion: Record<TipoAccion, number> = {
      "linkedin": 0.3,
      "email": 0.4,
      "llamada": 0.5,
      "seguimiento": 0.4,
      "demo": 0.7,
      "propuesta": 0.8,
      "reunión": 0.9,
      "descartar": 1.0,
    };
    
    const baseProb = scoreBANT * multTemp * (factoresAccion[accionId] || 0.5);
    return Math.min(0.95, Math.max(0.05, baseProb)); // Entre 5% y 95%
  };

  // Utilidad: determinar si una acción tiene éxito basada en probabilidad
  const determinarExito = (probabilidad: number): boolean => {
    return Math.random() < probabilidad;
  };

  // Helper para crear efectos base
  const efectosBase = (lead: Lead, accionId: TipoAccion): Partial<Lead> => {
    const incrementos: Record<TipoAccion, { interes: number; paciencia: number }> = {
      "llamada": { interes: 12, paciencia: 5 },
      "email": { interes: 8, paciencia: 8 },
      "linkedin": { interes: 6, paciencia: 10 },
      "demo": { interes: 20, paciencia: 5 },
      "propuesta": { interes: 15, paciencia: 5 },
      "reunión": { interes: 25, paciencia: 10 },
      "seguimiento": { interes: 5, paciencia: 15 },
      "descartar": { interes: 0, paciencia: 0 },
    };
    const inc = incrementos[accionId] || { interes: 5, paciencia: 5 };
    const probBase = (lead.bant.presupuesto + lead.bant.necesidad + lead.bant.autoridad + lead.bant.plazo) / 400;
    const multTemp = lead.temperatura === "hot" ? 1.3 : lead.temperatura === "warm" ? 1.0 : 0.7;
    const probCierre = Math.min(95, Math.round((lead.bant.presupuesto + lead.bant.necesidad + lead.bant.autoridad + lead.bant.plazo) / 4 * multTemp));
    
    return {
      interes: Math.min(100, lead.interes + inc.interes),
      paciencia: Math.min(100, lead.paciencia + inc.paciencia),
      probabilidadCierre: Math.min(95, probCierre),
      ultimaInteraccion: Date.now(),
    };
  };

  // === LLAMADA ===
  if (accionId === "llamada") {
    // Descubrir si es decisor (probabilidad basada en autoridad)
    const esDecisor = Math.random() < (b.autoridad / 100);
    const probExito = Math.min(0.8, b.autoridad / 100 * 0.8 + 0.2); // 20-80%
    const exito = Math.random() < probExito;

    if (esDecisor && exito) {
      // Llamada exitosa con decisor: descubre info, agenda demo, avanza a "contactado" (no calificado aún)
      const efectos = { ...calcularEfectosBANT(lead, "llamada"), interes: Math.min(100, lead.interes + 15), paciencia: Math.min(100, lead.paciencia + 8) };
      return {
        texto: `📞 Llamada exitosa con ${nombreContacto}. Es el decisor. Confirmó dolor real ($${lead.valorEstimado.toLocaleString()}/año de impacto), hay urgencia (Q2) y budget aprobado. Agendó demo para la próxima semana.`,
        tipo: "excelente",
        lead: {
          ...lead,
          ...efectosBase(lead, "llamada"),
          estado: "contactado", // NO salta a calificado - necesita demo/propuesta
          paciencia: Math.min(100, lead.paciencia + 10),
          temperatura: lead.temperatura === "cold" ? "warm" : lead.temperatura,
          notas: [...lead.notas, `Llamada ${new Date().toLocaleDateString()}: Decisor confirmado, demo agendada. BANT parcial: B${b.presupuesto} A${b.autoridad} N${b.necesidad} T${b.plazo}`],
        },
      };
    }
    
    if (esDecisor && !exito) {
      return {
        texto: `📞 Llamada con ${nombreContacto} (es decisor). Escuchó pero no hay urgencia real: "Mándame info por email, lo vemos en Q3". No hay dolor urgente ni plazo.`,
        tipo: "neutro",
        lead: {
          ...lead,
          ...efectosBase(lead, "llamada"),
          estado: "contactado",
          interes: Math.max(0, lead.interes - 5),
          paciencia: Math.max(0, lead.paciencia - 5),
          notas: [...lead.notas, `Llamada ${new Date().toLocaleDateString()}: Decisor sin urgencia`],
        },
      };
    }

    // No es decisor
    return {
      texto: `📞 Llamaste a ${nombreContacto}, pero no decide. Te derivó a ${b.autoridad > 50 ? "su jefe" : "otro departamento"}. Perdiste 45 min.`,
      tipo: "malo",
      lead: {
        ...lead,
        estado: "contactado",
        interes: Math.max(0, lead.interes - 8),
        paciencia: Math.max(0, lead.paciencia - 15),
        notas: [...lead.notas, `Llamada ${new Date().toLocaleDateString()}: Contacto equivocado (autoridad ${b.autoridad})`],
      },
    };
  }

  // === EMAIL ===
  if (accionId === "email") {
    const solido = b.presupuesto >= 45 && b.necesidad >= 45;
    const probRespuesta = solido ? 0.65 : 0.25;
    const respondio = Math.random() < probRespuesta;

    if (respondio && solido) {
      const efectos = { ...calcularEfectosBANT(lead, "email"), interes: Math.min(100, lead.interes + 10) };
      return {
        texto: `📧 Email respondido con datos concretos: presupuesto confirmado ($${lead.valorEstimado.toLocaleString()}/año), dolor urgente (${b.necesidad}/100), plazo Q2. Tienes BANT parcial: B${b.presupuesto} N${b.necesidad}.`,
        tipo: "bueno",
        lead: {
          ...lead,
          ...efectosBase(lead, "email"),
          estado: "contactado",
          notas: [...lead.notas, `Email ${new Date().toLocaleDateString()}: Respuesta sólida - B${b.presupuesto} N${b.necesidad}`],
        },
      };
    }
    if (respondio && !solido) {
      return {
        texto: `📧 Respondieron: "Gracias, lo revisaremos". Sin presupuesto confirmado, sin autoridad clara, sin plazo. Seguimiento en 5 días.`,
        tipo: "neutro",
        lead: {
          ...lead,
          ...efectosBase(lead, "email"),
          estado: "contactado",
          notas: [...lead.notas, `Email ${new Date().toLocaleDateString()}: Respuesta evasiva`],
        },
      };
    }
    // No respondieron
    return {
      texto: `📧 Sin respuesta a tu email tras 5 días. ${nombreContacto} no abrió ni clickeó. Lead se enfría.`,
      tipo: "malo",
      lead: {
        ...lead,
        interes: Math.max(0, lead.interes - 8),
        paciencia: Math.max(0, lead.paciencia - 10),
        estado: lead.estado === "nuevo" ? "enfriado" : lead.estado,
        notas: [...lead.notas, `Email ${new Date().toLocaleDateString()}: Sin respuesta`],
      },
    };
  }

  // === LINKEDIN ===
  if (accionId === "linkedin") {
    const acepto = Math.random() < 0.65;
    if (acepto) {
      return {
        texto: `🔗 Conectado con ${lead.contacto} en LinkedIn. Aceptó al instante. Vió tu perfil (3 visitas). Envía mensaje de valor en 24h.`,
        tipo: "bueno",
        lead: {
          ...lead,
          ...efectosBase(lead, "linkedin"),
          estado: "contactado",
          notas: [...lead.notas, `LinkedIn ${new Date().toLocaleDateString()}: Conexión aceptada`],
        },
      };
    }
    return {
      texto: `🔗 Solicitud de conexión a ${lead.contacto} en LinkedIn. Sin respuesta tras 5 días.`,
      tipo: "neutro",
      lead: {
        ...lead,
        notas: [...lead.notas, `LinkedIn ${new Date().toLocaleDateString()}: Sin respuesta`],
      },
    };
  }

  // === DEMO ===
  if (accionId === "demo") {
    // Demo solo tiene sentido si hay dolor real (necesidad) y plazo razonable
    const probExito = (b.necesidad / 100) * 0.6 + (b.plazo / 100) * 0.4; // 0-1
    const exito = Math.random() < probExito;

    if (exito) {
      return {
        texto: `🖥️ Demo completada con ${lead.contacto} y su equipo técnico (${2 + Math.floor(Math.random() * 3)} personas). Preguntas profundas sobre integración, seguridad, API. Pidieron propuesta formal para comité de compra.`,
        tipo: "excelente",
        lead: {
          ...lead,
          ...efectosBase(lead, "demo"),
          estado: "propuesta_enviada",
          interes: Math.min(100, lead.interes + 25),
          paciencia: Math.min(100, lead.paciencia + 10),
          probabilidadCierre: Math.min(85, lead.probabilidadCierre + 30),
          notas: [...lead.notas, `Demo ${new Date().toLocaleDateString()}: Propuesta solicitada. Equipo técnico validado.`],
        },
      };
    }
    return {
      texto: `🖥️ Demo con ${lead.contacto} y su equipo. Preguntas superficiales ("¿tiene app móvil?"), sin dolor real detectado, sin timeline. "Nos lo pensamos, mándenos info". Perdiste 2 slots valiosos.`,
      tipo: "malo",
      lead: {
        ...lead,
        interes: Math.max(0, lead.interes - 15),
        paciencia: Math.max(0, lead.paciencia - 25),
        estado: "enfriado",
        notas: [...lead.notas, `Demo ${new Date().toLocaleDateString()}: Sin dolor real, sin urgencia`],
      },
    };
  }

  // === PROPUESTA ===
  if (accionId === "propuesta") {
    // Solo funciona si hay BANT sólido: necesidad + plazo + presupuesto + autoridad
    const bantScore = (b.necesidad + b.plazo + b.presupuesto + b.autoridad) / 400;
    const probExito = Math.min(0.9, bantScore * 0.9); // 0-90%
    const exito = Math.random() < probExito;

    if (exito) {
      const valor = Math.round(lead.valorEstimado * (0.85 + Math.random() * 0.3)); // 85-115% del estimado
      return {
        texto: `📄 Propuesta enviada y ACEPTADA. ${lead.empresa} entra al pipeline formal por $${valor.toLocaleString()}/año. Comité aprobó: "ROI claro, timeline realista, confianza en el equipo".`,
        tipo: "excelente",
        lead: {
          ...lead,
          estado: "calificado",
          interes: 100,
          paciencia: 95,
          probabilidadCierre: 98,
          valorEstimado: Math.round(lead.valorEstimado * 1.05),
          notas: [...lead.notas, `Propuesta ${new Date().toLocaleDateString()}: ACEPTADA - $${valor.toLocaleString()}/año`],
        },
        pipelineGenerado: Math.round(lead.valorEstimado * 1.05),
      };
    }
    // Fallo: propuesta rechazada o ghosted
    const razones = [
      "Precio fuera de presupuesto aprobado",
      "Timeline irrealista para su implementación",
      "Competidor ofreció 20% menos",
      "Falta sponsor ejecutivo para firmar",
      "Equipo técnico rechazó la integración",
    ];
    const razon = razones[Math.floor(Math.random() * razones.length)];
    return {
      texto: `📄 Propuesta enviada a ${lead.empresa}. ${razon}. "Nos lo pensamos para el próximo trimestre". Lead enfriado.`,
      tipo: "malo",
      lead: {
        ...lead,
        estado: "enfriado",
        paciencia: Math.max(0, lead.paciencia - 30),
        interes: Math.max(0, lead.interes - 20),
        notas: [...lead.notas, `Propuesta ${new Date().toLocaleDateString()}: Rechazada - ${razon}`],
      },
    };
  }

  // === SEGUIMIENTO ===
  if (accionId === "seguimiento") {
    const eraFrio = lead.estado === "enfriado";
    const reactivado = lead.estado === "enfriado" && Math.random() < 0.4; // 40% reactivar
    
    if (eraFrio && reactivado) {
      return {
        texto: `🔄 Re-contactaste a ${lead.contacto} tras 3 semanas de silencio. "¡Buen timing! Reabrimos presupuesto para Q2, agendemos demo". Lead REACTIVADO.`,
        tipo: "excelente",
        lead: {
          ...lead,
          ...efectosBase(lead, "seguimiento"),
          estado: "contactado",
          interes: Math.min(100, lead.interes + 25),
          paciencia: Math.min(100, lead.paciencia + 35),
          notas: [...lead.notas, `Seguimiento ${new Date().toLocaleDateString()}: REACTIVADO - Reabren presupuesto`],
        },
      };
    }
    if (eraFrio && !reactivado) {
      return {
        texto: `🔄 Seguimiento a ${lead.contacto} (estaba frío). "Gracias por insistir, pero ya contratamos a competidor el mes pasado". Lead PERDIDO definitivamente.`,
        tipo: "malo",
        lead: {
          ...lead,
          estado: "descartado",
          interes: 0,
          paciencia: 0,
          notas: [...lead.notas, `Seguimiento ${new Date().toLocaleDateString()}: Perdido vs competencia`],
        },
      };
    }
    // Seguimiento normal (mantenimiento)
    return {
      texto: `🔄 Seguimiento con ${lead.contacto}. "Gracias por insistir, la semana que viene revisamos con el comité técnico". Mantenido caliente.`,
      tipo: "bueno",
      lead: {
        ...lead,
        ...efectosBase(lead, "seguimiento"),
        interes: Math.min(100, lead.interes + 8),
        paciencia: Math.min(100, lead.paciencia + 12),
        notas: [...lead.notas, `Seguimiento ${new Date().toLocaleDateString()}: Mantenido caliente`],
      },
    };
  }

  // === REUNIÓN EJECUTIVA (solo enterprise) ===
  if (accionId === "reunión") {
    // Solo para deals enterprise con BANT muy alto
    const bantScore = (b.necesidad + b.plazo + b.presupuesto + b.autoridad) / 400;
    const exito = Math.random() < (bantScore * 0.85);
    
    if (exito) {
      const valor = Math.round(lead.valorEstimado * (1.1 + Math.random() * 0.4));
      return {
        texto: `🤝 Reunión ejecutiva con ${lead.contacto} + CFO + CTO. Negociación directa: cerraron $${valor.toLocaleString()}/año por 3 años con SLA premium. Contrato firmado in situ.`,
        tipo: "excelente",
        lead: {
          ...lead,
          estado: "calificado",
          interes: 100,
          paciencia: 100,
          probabilidadCierre: 99,
          valorEstimado: Math.round(lead.valorEstimado * 1.2),
          notas: [...lead.notas, `Reunión ejecutiva ${new Date().toLocaleDateString()}: CERRADO $${valor.toLocaleString()}/año x 3 años`],
        },
        pipelineGenerado: Math.round(lead.valorEstimado * 1.2),
      };
    }
    return {
      texto: `🤝 Reunión ejecutiva con ${lead.contacto} + CFO. CFO bloquea: "ROI no claro a 12 meses, necesitamos caso de negocio". Reunión inconclusa. 3 slots quemados.`,
      tipo: "malo",
      lead: {
        ...lead,
        interes: Math.max(0, lead.interes - 10),
        paciencia: Math.max(0, lead.paciencia - 20),
        notas: [...lead.notas, `Reunión ejecutiva ${new Date().toLocaleDateString()}: Bloqueado por CFO`],
      },
    };
  }

  // === DESCARTAR ===
  if (accionId === "descartar") {
    return {
      texto: `🗑️ Descartaste a ${lead.empresa}. Tu agenda respira… pero ese pipeline potencial ($${lead.valorEstimado.toLocaleString()}) se lo lleva la competencia.`,
      tipo: "neutro",
      lead: { ...lead, estado: "descartado", notas: [...lead.notas, `Descartado ${new Date().toLocaleDateString()}: Decisión estratégica`] },
    };
  }

  return { texto: "Acción no reconocida", tipo: "neutro" };
}

export function accionDisponible(lead: Lead, accionId: TipoAccion): boolean {
  const accion = ACCIONES.find(a => a.id === accionId);
  if (!accion || !accion.requiereEstado) return true;
  return accion.requiereEstado.includes(lead.estado);
}

export const FINALES: FinalLead[] = [
  {
    id: "oro",
    rank: "S",
    title: "Cazador de Élite",
    text: "No perseguiste todo: cazaste lo que valía la pena. Pipeline $400K+, 8+ deals calificados, ticket medio $55K, ciclo medio 22 días. Tu manager dejó de pedir reportes y empezó a pedirte que mentores a los juniors. La diferencia no es trabajar más, es trabajar solo lo que cierra.",
    condicion: { pipelineMin: 350000, calificadosMin: 7, ticketMedioMin: 45000 },
  },
  {
    id: "plata",
    rank: "A",
    title: "Pipeline de Acero",
    text: "Superaste la meta ($220K) con una cartera limpia: 5 deals calificados, 0 leads quemados, ciclo medio 28 días. No todos firmaron, pero los que tocaste estaban trabajados quirúrgicamente. La diferencia entre suerte y método se ve en el cierre de mes.",
    condicion: { pipelineMin: 200000, calificadosMin: 5 },
  },
  {
    id: "bronce",
    rank: "B",
    title: "Cumpliste el Cupo",
    text: "Llegaste a $150K raspando. 3 deals cerrados, pero 4 leads calientes se enfriaron en tu bandeja esperando seguimiento. El número cumple, pero el próximo mes empieza de cero porque este pipeline no se auto-renueva. La consistencia es el siguiente nivel.",
    condicion: { pipelineMin: 120000, calificadosMin: 3 },
  },
  {
    id: "hierro",
    rank: "C",
    title: "Semana de Supervivencia",
    text: "Agenda llena, pipeline $80K. Muchas llamadas, pocos demos, 0 propuestas. Los leads que sí querían comprar se enfriaron esperando tu llamada. La semana que viene empiezas de cero con la misma lección: actividad ≠ resultados.",
    condicion: { pipelineMin: 50000 },
  },
  {
    id: "cero",
    rank: "D",
    title: "Cero Pipeline",
    text: "Dos semanas de llamadas, emails, demos y agenda llena. Cero propuestas firmadas. El problema no fue el volumen de trabajo, fue a quién le diste tu tiempo: cada lead descartado sin criterio era un cliente que tu competencia atendió gratis.",
  },
];

export const cazadorLeads: LeadGameData = {
  slug: "cazador-leads",
  title: "Cazador de Leads",
  tagline: "5 días. Decenas de leads. Una agenda. Caza lo que cierra.",
  icon: "🎯",
  category: "Prospección",
  difficulty: 2,
  minutes: 12,
  description:
    "Simulador realista de prospección B2B. Gestiona tu agenda, califica con BANT, prioriza por valor y probabilidad, y construye pipeline que de verdad cierra. Cada slot cuenta.",
  accent: "#D946EF",
  imagen: "/img/cazador-leads.jpg",
  escenarioInicial: "semana-1",
  escenarios: [ESCENARIO_SEMANA, ESCENARIO_VERANO, ESCENARIO_ENTERPRISE],
  acciones: ACCIONES,
  finales: FINALES,
};

export function calcularValorPipeline(leads: Lead[]): number {
  return leads
    .filter((l) => l.estado === "calificado" || l.estado === "negociando")
    .reduce((acc, l) => acc + l.valorEstimado, 0);
}

export function contarCalificados(leads: Lead[]): number {
  return leads.filter((l) => l.estado === "calificado" || l.estado === "negociando").length;
}

export function enfriarLeads(leads: Lead[]): Lead[] {
  return leads.map((l) => {
    if (l.estado !== "nuevo" && l.estado !== "contactado") return l;
    const paciencia = l.paciencia - 15;
    const interes = Math.max(0, l.interes - 5);
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
  const ticketMedio = calificados > 0
    ? leads.filter(l => l.estado === "calificado" || l.estado === "negociando").reduce((a, l) => a + l.valorEstimado, 0) / calificados
    : 0;

  for (const f of finales) {
    if (!f.condicion) return f;
    if (f.condicion.pipelineMin !== undefined && pipeline < f.condicion.pipelineMin) continue;
    if (f.condicion.calificadosMin !== undefined && calificados < f.condicion.calificadosMin) continue;
    if (f.condicion.ticketMedioMin !== undefined && ticketMedio < f.condicion.ticketMedioMin) continue;
    return f;
  }
  return finales[finales.length - 1];
}