import type { GameData, Escenario, Stat, Choice, RoundType, RoundConfig } from "./types";

const escenarioVIP: Escenario = {
  id: "vip",
  titulo: "Cliente VIP en Crisis",
  etiqueta: "Caso Multiruta con Baraja Dinámica",
  contexto:
    "Eres agente senior de la cuenta más importante de la empresa. Ana Rojas, cliente VIP con $48.000 facturados este año, acaba de escribir un mensaje desesperado antes de su lanzamiento. Cada partida presenta 7 rondas en orden diferente con decisiones que afectan el mazo restante.",
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
      texto: "Tu director de ventas vio el chat de Ana y te manda un mensaje directo: '¿Qué pasa ahí? Llámalos y diles que cubrimos nosotros el envío exprés'.",
      efectos: [{ stat: "pac", delta: -15 }],
    },
  ],
  escenas: [],
  finales: [
    {
      id: "best",
      rank: "S",
      title: "Cliente para toda la vida",
      conditions: [{ stat: "sat", min: 78 }, { stat: "pac", min: 68 }, { stat: "cta", min: 45000 }],
      text: "Ana renueva por otros 3 años y te refiere a dos empresas de su red. Tu gerente pregunta cómo lo hiciste. La respuesta: tomaste propiedad, fuiste transparente y nunca dejaste sola a la cliente. $48.000 se convirtieron en $190.000 de valor de vida de cliente.",
    },
    {
      id: "good",
      rank: "A",
      title: "Salvaste la cuenta",
      conditions: [{ stat: "sat", min: 64 }, { stat: "pac", min: 52 }],
      text: "Ana se queda. No todo quedó perfecto, y ella lo dice: 'Me quedo por ti, no por la empresa.' Es frágil, pero real. El plan de seguimiento trimestral que prometiste ahora es tu tarea más importante.",
    },
    {
      id: "mid",
      rank: "B",
      title: "Rescate parcial",
      conditions: [{ stat: "sat", min: 44 }],
      text: "El pedido llegó y el lanzamiento salió adelante. Pero Ana redujo su siguiente orden a la mitad. 'Siguen en prueba', escribió. La cuenta sobrevive, la confianza no: te tomará meses recuperarla.",
    },
    {
      id: "bad",
      rank: "D",
      title: "Cancelación consumada",
      text: "A las 9:00 AM llega el correo formal de cancelación. La competencia ofreció lo mismo que tú, pero con atención proactiva. La lección duele: en clientes premium, la relación vale más que el producto.",
    },
  ],
};

const escenarioEnterprise: Escenario = {
  id: "enterprise",
  titulo: "Incidente Enterprise (SLA Roto)",
  etiqueta: "Modo Difícil con Baraja Dinámica",
  contexto:
    "Una corporación de 5,000 empleados sufre una caída de pasarela de pagos en pleno Black Friday. El contrato en riesgo es de $150.000 anuales. Cada partida presenta 7 rondas en orden diferente con decisiones que afectan el mazo restante.",
  inicio: "apertura",
  stats: [
    { key: "sat", label: "Satisfacción", icon: "😊", max: 100 },
    { key: "pac", label: "Paciencia", icon: "⏳", max: 100 },
    { key: "cta", label: "Valor de cuenta", icon: "💰", max: 180000, initial: 150000, format: "money" },
  ],
  eventos: [
    {
      id: "hackermedia",
      titulo: "Alerta de Prensa",
      icono: "📰",
      prob: 0.25,
      unaVez: true,
      texto: "Un blog tecnológico publica que la pasarela de pagos está caída.",
      efectos: [{ stat: "pac", delta: -15 }],
    },
  ],
  escenas: [],
  finales: [
    {
      id: "ent-best",
      rank: "S",
      title: "Resiliencia Enterprise",
      conditions: [{ stat: "sat", min: 75 }, { stat: "pac", min: 70 }],
      text: "Convertiste una crisis catastrófica de Black Friday en un testimonio de confianza. GlobalCorp renovó por 2 años más y te nombró proveedor estratégico.",
    },
    {
      id: "ent-good",
      rank: "A",
      title: "Tormenta superada",
      conditions: [{ stat: "sat", min: 55 }],
      text: "El servicio se estabilizó y la cuenta sobrevivió, aunque con ciertos descuentos y costos operativos absorbidos. Buen manejo de crisis.",
    },
    {
      id: "ent-bad",
      rank: "D",
      title: "SLA Incumplido",
      text: "La falta de tacto y los reembolsos mal gestionados llevaron a GlobalCorp a rescindir el contrato al finalizar el trimestre.",
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
    "Simulador de resolución de crisis con clientes de alto valor. Cada partida presenta 7 rondas en orden diferente, con eventos sorpresa y decisiones que afectan el mazo restante. Ya no hay dos partidas iguales.",
  escenarioInicial: "vip",
  escenarios: [escenarioVIP, escenarioEnterprise],
};