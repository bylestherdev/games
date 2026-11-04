import type { GameData, Escenario, Stat, Choice, RoundType, RoundConfig } from "./types";

const escenarioVIP: Escenario = {
  id: "vip",
  titulo: "Crisis VIP: El Lanzamiento de Ana Rojas",
  etiqueta: "Gestión de Crisis - Cliente Estratégico",
  contexto:
    "Son las 23:47 del viernes. Ana Rojas, CEO de una startup en hipercrecimiento (facturación $48K/año, proyección $200K), acaba de escribir: 'El pago falla en producción. Mi lanzamiento es el lunes. Si no resuelvo esto, pierdo 3 años de trabajo'. Es tu cuenta más grande. Tu paciencia, empatía y capacidad técnica decidirán si la retienes o la pierdes para la competencia. Tienes 7 interacciones para resolver la crisis y fortalecer la relación.",
  inicio: "apertura",
  stats: [
    { key: "sat", label: "Satisfacción", icon: "😊", max: 100 },
    { key: "pac", label: "Paciencia", icon: "⏳", max: 100 },
    { key: "cta", label: "Valor de cuenta", icon: "💰", max: 60000, initial: 48000, format: "money" },
  ],
  eventos: [
    {
      id: "gerente-enojado",
      titulo: "Intervención de Gerencia",
      icono: "👔",
      prob: 0.25,
      unaVez: true,
      texto: "Tu Director de Ventas vio el hilo de Ana y te mandó un Slack directo: '¿Qué pasa ahí? Llámala YA y dile que cubrimos el envío exprés nosotros'. Su tono no admite réplica.",
      efectos: [{ stat: "pac", delta: -15 }],
    },
  ],
  escenas: [],
  poolRondasDisponibles: [
    "apertura",
    "investigacion",
    "tecnica",
    "precio",
    "contraoferta",
    "cierre",
    "alianza",
    "riesgo",
    "validacion",
    "sorpresa",
  ],
  finales: [
    {
      id: "best",
      rank: "S",
      title: "Cliente para Toda la Vida",
      conditions: [{ stat: "sat", min: 78 }, { stat: "pac", min: 68 }, { stat: "cta", min: 45000 }],
      text: "El lanzamiento del lunes fue impecable. Ana te escribió a las 6 AM: 'Gracias a ti dormí 4 horas. El pago fluye'. Renovó por 3 años ($144K) y te refirió a dos founders de su aceleradora. Tu director te ascendió a Senior Account Manager: 'Gestión de crisis de manual'. $48K se transformaron en $290K de valor de vida.",
    },
    {
      id: "good",
      rank: "A",
      title: "Crisis Resuelta, Confianza Ganada",
      conditions: [{ stat: "sat", min: 64 }, { stat: "pac", min: 52 }],
      text: "El pago se restableció a las 11 AM del lunes. Hubo tensión, pero Ana renovó por 1 año ($48K). 'Me quedo por cómo gestionaste esto, no por el producto', te dijo. El seguimiento trimestral que prometiste es ahora tu prioridad #1. La cuenta es frágil, pero recuperable.",
    },
    {
      id: "mid",
      rank: "B",
      title: "Rescate Parcial",
      conditions: [{ stat: "sat", min: 44 }],
      text: "El pago funcionó, pero el lanzamiento se retrasó 6 horas. Ana renovó 6 meses a precio reducido ($24K). 'Seguimos en evaluación', escribió. Tu equipo técnico debe entregar un post-mortem impecable este mes para recuperar la confianza plena.",
    },
    {
      id: "bad",
      rank: "D",
      title: "Cancelación Consumada",
      text: "A las 9:00 AM del lunes llegó el correo: 'Cancelamos. La competencia nos ofreció migración en 48h y SLA real'. La lección duele: en cuentas enterprise, la velocidad de respuesta y la transparencia valen más que el producto. $48K perdidos y una referencia negativa en el mercado.",
    },
  ],
};

const escenarioEnterprise: Escenario = {
  id: "enterprise",
  titulo: "Incidente Crítico: Black Friday GlobalCorp",
  etiqueta: "Gestión de Incidentes - Cuenta Enterprise",
  contexto:
    "Es viernes 24 de noviembre, 06:13 AM. La pasarela de pagos de GlobalCorp (5.000 empleados, $150K/año) cayó en pleno Black Friday. Cada minuto de caída son $47K en ventas perdidas. El CTO te exige resolución en 2 horas. El SLA estipula 99.9% uptime; ya vas en 94%. Tu equipo técnico trabaja en paralelo, pero la gestión de la comunicación, expectativas y confianza del cliente depende enteramente de ti. 7 puntos de contacto para estabilizar la cuenta.",
  inicio: "apertura",
  stats: [
    { key: "sat", label: "Satisfacción", icon: "😊", max: 100 },
    { key: "pac", label: "Paciencia", icon: "⏳", max: 100 },
    { key: "cta", label: "Valor de cuenta", icon: "💰", max: 180000, initial: 150000, format: "money" },
  ],
  eventos: [
    {
      id: "hackermedia",
      titulo: "Filtración a Prensa",
      icono: "📰",
      prob: 0.25,
      unaVez: true,
      texto: "TechCrunch acaba de publicar: 'GlobalCorp sufre outage crítico en Black Friday — clientes reportan pagos rechazados masivos'. El CTO te reenvía el enlace: 'Controla la narrativa AHORA'.",
      efectos: [{ stat: "pac", delta: -15 }],
    },
  ],
  escenas: [],
  poolRondasDisponibles: [
    "apertura",
    "investigacion",
    "tecnica",
    "precio",
    "contraoferta",
    "cierre",
    "alianza",
    "riesgo",
    "validacion",
    "sorpresa",
  ],
  finales: [
    {
      id: "ent-best",
      rank: "S",
      title: "Resiliencia Enterprise",
      conditions: [{ stat: "sat", min: 75 }, { stat: "pac", min: 70 }],
      text: "El servicio se restauró a las 08:47 AM. Ventas Black Friday: $2.3M recuperados de $2.4M proyectados. El CTO te llamó personalmente: 'No es la caída, es cómo la gestionaste'. GlobalCorp firmó 3 años a $450K/año con cláusula de co-inversión en redundancia. Te nombraron Strategic Partner.",
    },
    {
      id: "ent-good",
      rank: "A",
      title: "Tormenta Superada",
      conditions: [{ stat: "sat", min: 55 }],
      text: "Servicio restablecido a las 11:20 AM. Ventas recuperadas: $1.9M de $2.4M. GlobalCorp renovó 1 año ($150K) con penalizaciones por SLA reducidas 40%. 'Buen manejo, pero esperamos que no se repita', dijo el VP Engineering. El plan de redundancia que prometiste es tu compromiso Q1.",
    },
    {
      id: "ent-bad",
      rank: "D",
      title: "SLA Incumplido — Contrato Rescindido",
      text: "Servicio caído 4 horas 47 minutos. Ventas perdidas: $1.1M. GlobalCorp ejecutó la cláusula de terminación por SLA incumplido. El correo del Legal llegó a las 3 PM: 'Efectivo inmediato'. La competencia ya está en fase de migración. La lección: en enterprise, la comunicación proactiva durante la crisis vale más que la resolución técnica tardía.",
    },
  ],
};

export const atencionCliente: GameData = {
  slug: "atencion-cliente",
  title: "Atención al Cliente Premium",
  tagline: "Cada mensaje puede salvar… o perder la cuenta.",
  icon: "🎧",
  category: "Servicio",
  difficulty: 2,
  minutes: 6,
  accent: "#D946EF",
  imagen: "/img/atencion-cliente.jpg",
  description:
    "Simulador de resolución de crisis con clientes de alto valor. Toma decisiones estratégicas que afectan el rumbo de cada partida. Cada sesión presenta desafíos únicos que pondrán a prueba tu habilidad para gestionar crisis y mantener la satisfacción del cliente.",
  escenarioInicial: "vip",
  escenarios: [escenarioVIP, escenarioEnterprise],
};