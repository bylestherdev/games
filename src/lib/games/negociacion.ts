import type { GameData, Escenario, Stat, Choice, RoundType, RoundConfig } from "./types";

const escenarioVeronica: Escenario = {
  id: "veronica",
  titulo: "Negociación Maestra (Verónica Salas)",
  etiqueta: "Caso Multiruta con Baraja Dinámica",
  contexto:
    "El contrato vale $120.000 anuales. Enfrente está Verónica Salas, directora de compras, que ha negociado con 40 vendedores este año y les ganó a 38. Múltiples rutas y opciones de decisión, con baraja barajada cada partida.",
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
      texto: "Un competidor menor bajó el precio un 40% de última hora y Verónica lo menciona sobre la mesa.",
      efectos: [{ stat: "pal", delta: -10 }, { stat: "mar", delta: -8 }],
    },
  ],
  escenas: [],
  finales: [
    {
      id: "legend",
      rank: "S",
      title: "Maestra de la negociación",
      conditions: [{ stat: "rel", min: 70 }, { stat: "mar", min: 55 }, { stat: "pal", min: 55 }],
      text: "Contrato firmado en término medio alto, relación intacta y palanca para renovaciones. Verónica te recomienda personalmente en su gremio.",
    },
    {
      id: "great",
      rank: "A",
      title: "Cierre profesional",
      conditions: [{ stat: "rel", min: 50 }, { stat: "mar", min: 40 }],
      text: "Firmaste con margen razonable y una relación sólida. Verónica te respeta como partner comercial.",
    },
    {
      id: "bad",
      rank: "D",
      title: "\"Lo perspective\".",
      text: "La negociación fracasó o cediste tanto margen que el contrato ya no era rentable.",
    },
  ],
};

export const negociacion: GameData = {
  slug: "negociacion",
  title: "Negociación Maestra",
  tagline: "Un contrato. Siete rondas. Un mazo barajado cada partida.",
  icon: "🤝",
  category: "Ventas",
  difficulty: 3,
  minutes: 8,
  accent: "#C084FC",
  imagen: "/img/negociacion.jpg",
  description:
    "Simulador de negociación con baraja dinámica de 10 tipos de Ronda. Cada partida presenta 7 rondas en orden diferente, con decisiones que afectan el mazo restante y condiciones de cierre adaptativas.",
  escenarioInicial: "veronica",
  escenarios: [escenarioVeronica],
};