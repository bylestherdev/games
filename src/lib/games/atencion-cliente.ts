import type { GameData, Escenario } from "./types";

const escenarioVIP: Escenario = {
  id: "vip",
  titulo: "Cliente VIP en Crisis",
  etiqueta: "Caso Clásico (Multiruta)",
  contexto:
    "Eres agente senior de la cuenta más importante de la empresa. Ana Rojas, cliente VIP con $48.000 facturados este año, acaba de escribir un mensaje desesperado antes de su lanzamiento.",
  inicio: "s1",
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
      opciones: [
        {
          label: "Aceptar la ayuda del director y asumir el costo de imagen",
          hint: "Salva el pedido pero muestra debilidad",
          effects: [{ stat: "sat", delta: 10 }, { stat: "pac", delta: 10 }, { stat: "cta", delta: -1200 }],
          resultado: "El director interviene. Ana se calma, pero nota que tuviste que escalar.",
        },
        {
          label: "Decirle al director que lo tienes bajo control y resolver solo",
          hint: "Independencia total",
          effects: [{ stat: "sat", delta: 4 }, { stat: "pac", delta: 4 }, { stat: "cta", delta: 0 }],
          resultado: "Resuelves sin jefes. Ana valora tu autonomía.",
        },
      ],
    },
  ],
  escenas: [
    {
      id: "s1",
      chapter: "09:14 AM",
      title: "El mensaje rojo",
      text: [
        "El chat parpadea en rojo. Ana Rojas, VIP con $48.000 facturados este año, lleva dos semanas esperando su pedido.",
        "\"Llevo 14 días esperando. Mi lanzamiento es el viernes y ustedes me prometieron entrega en 48 horas. Quiero cancelar TODO y hablar con su gerente.\"",
        "El chat está abierto. Tu respuesta es lo único entre ella y la cancelación.",
      ],
      choices: [
        {
          label: "Disculparte de inmediato y ofrecer un 20% de descuento",
          hint: "Rápido, pero cuesta margen",
          effects: [{ stat: "sat", delta: 12 }, { stat: "pac", delta: 8 }, { stat: "cta", delta: -1800 }],
          next: "s2_descuento",
          result: "Ana lee el mensaje. Silencio 40 segundos… \"No quiero descuentos. Quiero mi pedido.\"",
          flag: "ruta-descuento",
        },
        {
          label: "Pedirle detalles técnicos del error antes de responder nada",
          hint: "Investigar primero: correcto, pero burocrático",
          effects: [{ stat: "sat", delta: -4 }, { stat: "pac", delta: -10 }, { stat: "cta", delta: 0 }],
          next: "s2_burocracia",
          result: "\"¿Me está pidiendo formularios AHORA?\" Ana está al límite de su paciencia.",
          flag: "ruta-burocracia",
        },
        {
          label: "Tomar propiedad absoluta del problema y prometer respuesta en 1 hora",
          hint: "Liderazgo visible y empático",
          effects: [{ stat: "sat", delta: 8 }, { stat: "pac", delta: 14 }, { stat: "cta", delta: 0 }],
          next: "s2_empati",
          result: "\"Agradezco que alguien al menos se haga cargo. Tienes una hora exactas.\"",
          flag: "ruta-empatia",
        },
      ],
    },
    // Ruta A: Descuento
    {
      id: "s2_descuento",
      chapter: "10:05 AM",
      title: "Ruta de Reembolso e Inventario",
      text: [
        "Tras rechazar el descuento, Ana exige saber si el paquete está realmente retenido en aduanas o en la bodega central.",
        "Tienes dos opciones de inventario para explorar con ella.",
      ],
      choices: [
        {
          label: "Decirle la verdad: el paquete fue extraviado por el courier externo",
          hint: "Transparencia total, aunque duele",
          effects: [{ stat: "sat", delta: 4 }, { stat: "pac", delta: -6 }, { stat: "cta", delta: 0 }],
          next: "s3_crisis_final",
          result: "\"Al menos no me mienten con aduanas\", responde con frialdad.",
        },
        {
          label: "Gestionar reenvío prioritario inmediato desde bodega local",
          hint: "Acción correctiva express",
          effects: [{ stat: "sat", delta: 14 }, { stat: "pac", delta: 10 }, { stat: "cta", delta: -1500 }],
          next: "s3_crisis_final",
          result: "Ordenas el reenvío inmediato. El stock local se compromete pero se salva el día.",
        },
      ],
    },
    // Ruta B: Burocracia
    {
      id: "s2_burocracia",
      chapter: "10:15 AM",
      title: "Escalada al Supervisor",
      text: [
        "Tu insistencia en formularios hizo que Ana contactara por su cuenta al director general de tu empresa en LinkedIn.",
        "Tu jefe te llama furioso a tu escritorio.",
      ],
      choices: [
        {
          label: "Explicarle a tu jefe que seguiste el protocolo estricto de la compañía",
          hint: "Defensa reglamentaria",
          effects: [{ stat: "sat", delta: -15 }, { stat: "pac", delta: -14 }, { stat: "cta", delta: 0 }],
          next: "s3_crisis_final",
          result: "\"A los clientes VIP no se les aplica protocolo, se les da solución\", te grita tu jefe.",
        },
        {
          label: "Asumir el error y pedirle al jefe que te deje liderar la llamada de rescate",
          hint: "Reconocer el tropiezo y rectificar",
          effects: [{ stat: "sat", delta: 6 }, { stat: "pac", delta: 4 }, { stat: "cta", delta: 0 }],
          next: "s3_crisis_final",
          result: "Te da 30 minutos para arreglarlo antes de intervenir él mismo.",
        },
      ],
    },
    // Ruta C: Empatía
    {
      id: "s2_empati",
      chapter: "10:20 AM",
      title: "Acción de Campo",
      text: [
        "Cumpliste tu promesa de la hora: investigaste personalmente en la bodega y encontraste la última caja disponible.",
        "Pero la caja tiene un golpe leve en el embalaje exterior.",
      ],
      choices: [
        {
          label: "Enviar la caja golpeada con una nota firmada a mano y producto de cortesía extra",
          hint: "Honestidad y detalle humano",
          effects: [{ stat: "sat", delta: 16 }, { stat: "pac", delta: 12 }, { stat: "cta", delta: -400 }],
          next: "s3_crisis_final",
          result: "Ana abre la caja, ve la nota y sonríe: \"Detalles así salvan relaciones\".",
        },
        {
          label: "Retener la caja para cambiar el embalaje, retrasando la entrega 24 horas más",
          hint: "Perfeccionismo a destiempo",
          effects: [{ stat: "sat", delta: -10 }, { stat: "pac", delta: -18 }, { stat: "cta", delta: 0 }],
          next: "s3_crisis_final",
          result: "\"¡Te pedí el pedido para hoy, no una caja perfecta mañana!\"",
        },
      ],
    },
    // Escena final común de convergencia o cierre
    {
      id: "s3_crisis_final",
      chapter: "05:00 PM",
      title: "El Veredicto de la Cuenta",
      text: [
        "El día ha sido una montaña rusa de decisiones y contención.",
        "Ana evalúa si mantiene su contrato activo con ustedes o si migra a la competencia.",
      ],
      choices: [
        {
          label: "Enviar resumen de compromisos y cerrar caso",
          hint: "Evaluación final",
          effects: [],
          next: "END",
          result: "Calculando puntaje final del caso de atención al cliente...",
        },
      ],
    },
  ],
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
      text: "Ana se queda. No todo quedó perfecto, y ella lo dice: \"Me quedo por ti, no por la empresa.\" Es frágil, pero real. El plan de seguimiento trimestral que prometiste ahora es tu tarea más importante.",
    },
    {
      id: "mid",
      rank: "B",
      title: "Rescate parcial",
      conditions: [{ stat: "sat", min: 44 }],
      text: "El pedido llegó y el lanzamiento salió adelante. Pero Ana redujo su siguiente orden a la mitad. \"Siguen en prueba\", escribió. La cuenta sobrevive, la confianza no: te tomará meses recuperarla.",
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
  etiqueta: "Modo Difícil (Multiruta)",
  contexto:
    "Una corporación de 5,000 empleados sufre una caída de pasarela de pagos en pleno Black Friday. El contrato en riesgo es de $150.000 anuales.",
  inicio: "e1",
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
  escenas: [
    {
      id: "e1",
      chapter: "10:00 AM",
      title: "Alerta Enterprise",
      text: [
        "El canal de Slack con el CTO de GlobalCorp arde: 'Nuestra pasarela rechaza el 40% de tarjetas en pleno Black Friday. Perdemos $10,000 por minuto'.",
      ],
      choices: [
        {
          label: "Abrir Zoom de emergencia inmediato con ingeniería en vivo",
          hint: "Transparencia radical",
          effects: [{ stat: "sat", delta: 15 }, { stat: "pac", delta: 12 }, { stat: "cta", delta: 0 }],
          next: "e2_zoom",
          result: "El CTO entra al Zoom en segundos y ve al equipo trabajando.",
          flag: "ruta-zoom",
        },
        {
          label: "Enviar reporte por escrito y pedir 4 horas de investigación",
          hint: "Protocolo burocrático",
          effects: [{ stat: "sat", delta: -15 }, { stat: "pac", delta: -20 }, { stat: "cta", delta: -5000 }],
          next: "e2_reporte",
          result: "\"¡Cuatro horas es una eternidad!\", grita el CTO.",
          flag: "ruta-reporte",
        },
      ],
    },
    {
      id: "e2_zoom",
      chapter: "11:00 AM",
      title: "Gabinete de Crisis Técnico",
      text: [
        "En el Zoom, el CTO propone dos opciones de arquitectura temporal para sortear el tráfico mientras se halla la causa raíz.",
      ],
      choices: [
        {
          label: "Seguir la sugerencia del CTO de rutear por pasarela secundaria de respaldo",
          hint: "Colaboración técnica directa",
          effects: [{ stat: "sat", delta: 12 }, { stat: "pac", delta: 10 }, { stat: "cta", delta: 0 }],
          next: "e3_final",
          result: "El tráfico fluye de nuevo en 15 minutos. El CTO respeta tu cintura técnica.",
        },
        {
          label: "Imponer tu propio parche de servidores propios sin consultar",
          hint: "Arrogancia técnica",
          effects: [{ stat: "sat", delta: -8 }, { stat: "pac", delta: -10 }, { stat: "cta", delta: 0 }],
          next: "e3_final",
          result: "Funciona, pero el CTO se sintió ignorado en su propia crisis.",
        },
      ],
    },
    {
      id: "e2_reporte",
      chapter: "11:15 AM",
      title: "Escalada Legal",
      text: [
        "Al demorar la respuesta, el departamento legal de GlobalCorp activa una notificación de incumplimiento de SLA por correo certificado.",
      ],
      choices: [
        {
          label: "Llamar al jefe legal de GlobalCorp y ofrecer compensación económica voluntaria inmediata",
          hint: "Cortar por lo sano",
          effects: [{ stat: "sat", delta: 6 }, { stat: "pac", delta: 4 }, { stat: "cta", delta: -15000 }],
          next: "e3_final",
          result: "Aceptan el descuento en la factura a cambio de retirar la carta.",
        },
        {
          label: "Contestar la carta con los términos y condiciones de fuerza mayor del contrato",
          hint: "Guerra de abogados",
          effects: [{ stat: "sat", delta: -20 }, { stat: "pac", delta: -25 }, { stat: "cta", delta: 0 }],
          next: "e3_final",
          result: "La tensión escala al máximo nivel directivo.",
        },
      ],
    },
    {
      id: "e3_final",
      chapter: "04:00 PM",
      title: "Cierre del Incidente Enterprise",
      text: [
        "El incidente ha quedado atrás o se ha convertido en litigio. Veamos el balance final.",
      ],
      choices: [
        {
          label: "Evaluar impacto y veredicto de cuenta",
          hint: "Cierre de caso",
          effects: [],
          next: "END",
          result: "Procesando métricas de la cuenta Enterprise...",
        },
      ],
    },
  ],
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
    "Simulador de resolución de crisis con clientes de alto valor con rutas ramificadas y eventos sorpresa.",
  escenarioInicial: "vip",
  escenarios: [escenarioVIP, escenarioEnterprise],
};
