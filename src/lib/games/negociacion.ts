import type { GameData, Escenario, Stat, Choice, RoundType, RoundConfig } from "./types";

const escenarioVeronica: Escenario = {
  id: "veronica",
  titulo: "Negociación Maestra: El Contrato con Verónica Salas",
  etiqueta: "Simulador de Negociación B2B",
  contexto:
    "Te sientas frente a Verónica Salas, Directora de Compras de una gran corporación. Ha cerrado acuerdos con 40 proveedores este año y solo dos lograron términos favorables. El contrato anual vale $120.000 y tu margen objetivo es del 35%. Verónica conoce cada táctica del manual y no cede sin obtener algo a cambio. Tienes 7 rondas para cerrar el mejor acuerdo posible sin romper la relación.",
  inicio: "apertura",
  stats: [
    { key: "rel", label: "Relación", icon: "🤝", max: 100 },
    { key: "mar", label: "Margen", icon: "📈", max: 100 },
    { key: "pal", label: "Palanca", icon: "⚔️", max: 100 },
  ],
  eventos: [
    {
      id: "competencia-baja",
      titulo: "Filtración de Competencia",
      icono: "📉",
      prob: 0.25,
      unaVez: true,
      texto: "Verónica pone sobre la mesa una propuesta de un competidor menor: 40% más barato, mismos SLAs. '¿Por qué no me voy con ellos?', pregunta sin inmutarse.",
      efectos: [{ stat: "pal", delta: -10 }, { stat: "mar", delta: -8 }],
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
      id: "legend",
      rank: "S",
      title: "Maestra de la Negociación",
      text: "Lograste un contrato a 3 años con margen del 38% y cláusulas de renovación automática. Verónica te dijo: 'Es la primera vez que alguien entiende mis KPIs antes de que yo los pida'. Te recomendó personalmente a tres directores de compras de su red. Tu comisión superó el objetivo trimestral en un 140%.",
    },
    {
      id: "great",
      rank: "A",
      title: "Cierre Profesional Sólido",
      text: "Firmaste a 2 años con margen del 32% y condiciones estándar. Verónica firmó sin objeciones finales: 'Trabajamos bien. Nos vemos en la renovación'. Cumpliste objetivo y dejaste la puerta abierta para crecer el cuenta el próximo año.",
    },
    {
      id: "mid",
      rank: "B",
      title: "Acuerdo Aceptable",
      text: "Cerraste a 1 año con margen del 24% —rentable, pero ajustado. Verónica cedió en plazos de pago pero exigió penalizaciones estrictas. 'Es lo que hay', dijo. El contrato se renueva, pero tendrás que trabajar el doble para recuperar margen el próximo ciclo.",
    },
    {
      id: "bad",
      rank: "D",
      title: "Oportunidad Perdida",
      text: "La negociación se rompió en la última ronda o cediste un 40% de margen para salvar el trato. Verónica firmó, pero su equipo ya está evaluando alternativas para el próximo año. Tu manager te preguntó: '¿Para qué firmar si no queda rentabilidad?'.",
    },
  ],
};

export const negociacion: GameData = {
  slug: "negociacion",
  title: "Negociación Maestra",
  tagline: "Un contrato con nuevas decisiones cada partida.",
  icon: "🤝",
  category: "Ventas",
  difficulty: 3,
  minutes: 8,
  accent: "#C084FC",
  imagen: "/img/negociacion.jpg",
  description:
    "Simulador de negociación. Cada partida presenta desafíos únicos con decisiones que afectan el rumbo y condiciones de cierre adaptativas.",
  escenarioInicial: "veronica",
  escenarios: [escenarioVeronica],
};