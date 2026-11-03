import type { GameData, Escenario } from "./types";

const escenarioVIP: Escenario = {
  id: "vip",
  titulo: "Cliente VIP en Crisis",
  etiqueta: "Caso Clásico",
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
      prob: 0.4,
      texto: "Tu director de ventas vio el chat de Ana y te manda un mensaje directo: '¿Qué pasa ahí? Llámalos y diles que cubrimos nosotros el envío exprés o te descuento el bono'.",
      opciones: [
        {
          label: "Aceptar la ayuda del director y asumir el costo de imagen",
          hint: "Salva el pedido pero muestra debilidad ante el cliente",
          effects: [{ stat: "sat", delta: 10 }, { stat: "pac", delta: 10 }, { stat: "cta", delta: -1200 }],
          resultado: "El director interviene. Ana se calma, pero nota que tuviste que escalar por encima de ti.",
        },
        {
          label: "Decirle al director que lo tienes bajo control y resolver solo",
          hint: "Independencia total",
          effects: [{ stat: "sat", delta: 4 }, { stat: "pac", delta: 4 }, { stat: "cta", delta: 0 }],
          resultado: "Resuelves sin jefes. Ana valora tu autonomía.",
        },
      ],
    },
    {
      id: "sistema-caido",
      titulo: "Caída de Servidores",
      icono: "⚠️",
      prob: 0.3,
      texto: "En medio de la emergencia, el sistema de logística de la empresa sufre una interrupción de 2 horas. Las notificaciones automáticas del cliente fallan.",
      efectos: [{ stat: "pac", delta: -12 }, { stat: "sat", delta: -8 }],
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
          effects: [
            { stat: "sat", delta: 12 },
            { stat: "pac", delta: 8 },
            { stat: "cta", delta: -1800 },
          ],
          next: "s2",
          result: "Ana lee el mensaje. Silencio 40 segundos… \"No quiero descuentos. Quiero mi pedido.\"",
          flag: "descuento-ofrecido",
        },
        {
          label: "Pedirle detalles técnicos antes de responder nada",
          hint: "Investigar primero: correcto, pero lento",
          effects: [
            { stat: "sat", delta: -4 },
            { stat: "pac", delta: -10 },
            { stat: "cta", delta: 0 },
          ],
          next: "s2",
          result: "\"¿Me está pidiendo formularios AHORA?\" Ana está al límite.",
          flag: "burocracia",
        },
        {
          label: "Tomar propiedad del problema y prometer una respuesta concreta en 1 hora",
          hint: "Liderazgo visible",
          effects: [
            { stat: "sat", delta: 8 },
            { stat: "pac", delta: 14 },
            { stat: "cta", delta: 0 },
          ],
          next: "s2",
          result: "\"Agradezco que alguien al menos se haga cargo. Tienes una hora.\"",
          flag: "propiedad-tomada",
        },
      ],
    },
    {
      id: "s2",
      chapter: "09:40 AM",
      title: "La causa raíz",
      text: [
        "Hablas con logística: el paquete se perdió en tránsito. Hay unidades en bodega local, pero enviarlas hoy cuesta $900 en envío express.",
        "Tu gerente no está. La decisión es tuya.",
      ],
      choices: [
        {
          label: "Autorizar el envío express de inmediato",
          hint: "Cuesta $900, salva el lanzamiento",
          effects: [
            { stat: "sat", delta: 16 },
            { stat: "pac", delta: 12 },
            { stat: "cta", delta: -900 },
          ],
          next: "s3",
          result: "El paquete sale en moto hacia la oficina de Ana. Respiras aliviado.",
        },
        {
          label: "Esperar al gerente para no arriesgar presupuesto",
          hint: "Proceso por encima de cliente",
          effects: [
            { stat: "sat", delta: -14 },
            { stat: "pac", delta: -18 },
            { stat: "cta", delta: 0 },
          ],
          next: "s3",
          result: "Cuando el gerente responde, ya son las 2:00 PM. Demasiado tarde.",
        },
        {
          label: "Ofrecer envío parcial: lo urgente hoy, el resto el lunes",
          hint: "Solución creativa de bajo costo",
          effects: [
            { stat: "sat", delta: 6 },
            { stat: "pac", delta: 4 },
            { stat: "cta", delta: -300 },
          ],
          next: "s3",
          result: "\"Me sirve para el viernes\", dice Ana. No es perfecto, pero funciona.",
        },
      ],
    },
    {
      id: "s3",
      chapter: "11:30 AM",
      title: "La llamada inesperada",
      text: [
        "Ana te llama por teléfono. Su tono ya no es de furia, sino de fría negociación.",
        "\"Mira, valoro que estés respondiendo. Pero tengo a mi directorio respirándome en la nuca. ¿Qué garantía real tengo de que la próxima renovación no será igual?\"",
      ],
      choices: [
        {
          label: "Prometer un SLA de atención 24/7 firmado por el VP",
          hint: "Garantía al más alto nivel",
          effects: [
            { stat: "sat", delta: 14 },
            { stat: "pac", delta: 10 },
            { stat: "cta", delta: 0 },
          ],
          next: "s4",
          result: "\"Eso ya suena a un compromiso corporativo serio.\"",
        },
        {
          label: "Ofrecer ser su punto de contacto directo personal exclusivo",
          hint: "Compromiso humano fuerte",
          effects: [
            { stat: "sat", delta: 18 },
            { stat: "pac", delta: 14 },
            { stat: "cta", delta: 0 },
          ],
          next: "s4",
          result: "\"De acuerdo. Contigo sí me siento respaldada.\"",
        },
        {
          label: "Decirle que con el descuento anterior ya debería estar satisfecha",
          hint: "Arrogancia fatal",
          effects: [
            { stat: "sat", delta: -22 },
            { stat: "pac", delta: -25 },
            { stat: "cta", delta: 0 },
          ],
          next: "s4",
          result: "Silencio sepulcral en la línea. \"Inaceptable respuesta.\"",
        },
      ],
    },
    {
      id: "s4",
      chapter: "03:15 PM",
      title: "El contratiempo final",
      text: [
        "El paquete llega a destino, pero el mensajero olvidó pedir la firma de recepción obligatoria y el sistema marca la entrega como incompleta.",
        "Ana te escribe otra vez: \"Me llegó la caja pero el repartidor se fue sin firmar. ¿Qué broma es esta?\"",
      ],
      choices: [
        {
          label: "Llamar al repartidor inmediatamente para que vuelva y recoja la firma",
          hint: "Diligencia impecable",
          effects: [
            { stat: "sat", delta: 10 },
            { stat: "pac", delta: 8 },
            { stat: "cta", delta: 0 },
          ],
          next: "s5",
          result: "El motorista regresa en 20 minutos y obtiene la firma. Ana lo confirma.",
        },
        {
          label: "Pedirle a Ana que ella misma firme un recibo digital en la web",
          hint: "Delegar fricción al cliente en crisis",
          effects: [
            { stat: "sat", delta: -8 },
            { stat: "pac", delta: -10 },
            { stat: "cta", delta: 0 },
          ],
          next: "s5",
          result: "\"No puedo creer que me hagan hacer su trabajo administrativo hoy.\"",
        },
        {
          label: "Hacerse cargo administrativamente y eximir la firma por esta vez",
          hint: "Flexibilidad orientada a resolver",
          effects: [
            { stat: "sat", delta: 6 },
            { stat: "pac", delta: 6 },
            { stat: "cta", delta: 0 },
          ],
          next: "s5",
          result: "\"Gracias por simplificarme las cosas hoy.\"",
        },
      ],
    },
    {
      id: "s5",
      chapter: "06:30 PM",
      title: "El cierre del día",
      text: [
        "El reloj marca el fin de la jornada. Tu bandeja de entrada está en cero.",
        "Ana ha publicado un post en LinkedIn elogiando el soporte técnico de la empresa… sin mencionar nombres, pero destacando la rápida respuesta.",
        "Mañana es un nuevo día. Veamos cómo evaluamos el caso.",
      ],
      choices: [
        {
          label: "Ver el balance final y cerrar la jornada",
          hint: "Conocer el veredicto de Ana",
          effects: [],
          next: "END",
          result: "Guardando métricas del caso de atención al cliente…",
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
  etiqueta: "Modo Difícil",
  contexto:
    "Una corporación de 5,000 empleados sufre una caída de pasarela de pagos en pleno Black Friday. El contrato en riesgo es de $150.000 anuales y el director de TI te escribe por Slack.",
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
      prob: 0.35,
      texto: "Un blog tecnológico publica que la pasarela de pagos está caída. El cliente te pide un comunicado oficial inmediato.",
      efectos: [{ stat: "pac", delta: -15 }],
    },
  ],
  escenas: [
    {
      id: "e1",
      chapter: "10:00 AM",
      title: "Alerta Enterprise",
      text: [
        "El canal de Slack con el CTO de GlobalCorp arde: 'Nuestra pasarela de pagos rechaza el 40% de las tarjetas de crédito. Estamos perdiendo $10,000 por minuto en ventas. Exijo explicación ya'.",
      ],
      choices: [
        {
          label: "Abrir puente de Zoom de emergencia inmediato con el equipo de ingeniería",
          hint: "Transparencia radical en tiempo real",
          effects: [{ stat: "sat", delta: 15 }, { stat: "pac", delta: 12 }, { stat: "cta", delta: 0 }],
          next: "e2",
          result: "El CTO entra al Zoom en 30 segundos. Ve a tus ingenieros trabajando en vivo y se calma un poco.",
        },
        {
          label: "Enviar un reporte por escrito detallando que investigarán en 4 horas",
          hint: "Protocolo burocrático estándar",
          effects: [{ stat: "sat", delta: -15 }, { stat: "pac", delta: -20 }, { stat: "cta", delta: -5000 }],
          next: "e2",
          result: "'¡Cuatro horas es una eternidad en Black Friday!', grita el CTO y amenaza con demanda por SLA.",
        },
        {
          label: "Reasignar servidores de inmediato sin avisar y reportar cuando esté resuelto",
          hint: "Acción sin comunicación previa",
          effects: [{ stat: "sat", delta: 5 }, { stat: "pac", delta: -5 }, { stat: "cta", delta: 0 }],
          next: "e2",
          result: "Funciona, pero el CTO odia enterarse tarde de lo que pasa en su infraestructura.",
        },
      ],
    },
    {
      id: "e2",
      chapter: "11:30 AM",
      title: "La compensación por SLA",
      text: [
        "El servicio vuelve a la normalidad tras un parche en caliente. El CTO reconoce el esfuerzo, pero exige un reembolso del 30% de la factura mensual por incumplimiento de SLA.",
      ],
      choices: [
        {
          label: "Aceptar el reembolso del 30% de inmediato para asegurar la renovación",
          hint: "Cuesta dinero pero protege la cuenta",
          effects: [{ stat: "sat", delta: 14 }, { stat: "pac", delta: 10 }, { stat: "cta", delta: -12500 }],
          next: "e3",
          result: "GlobalCorp acepta el abono y archiva el reclamo de incumplimiento.",
        },
        {
          label: "Ofrecer el doble de créditos en servicios cloud por un año en su lugar",
          hint: "Cuesta menos a la empresa y aporta valor",
          effects: [{ stat: "sat", delta: 10 }, { stat: "pac", delta: 8 }, { stat: "cta", delta: -2000 }],
          next: "e3",
          result: "\"Aceptamos los créditos. Es una solución inteligente.\"",
        },
        {
          label: "Rechazar el reembolso argumentando que fue caso fortuito",
          hint: "Defensa legal dura",
          effects: [{ stat: "sat", delta: -25 }, { stat: "pac", delta: -30 }, { stat: "cta", delta: 0 }],
          next: "e3",
          result: "\"Si ustedes no cumplen el contrato, nuestros abogados hablarán mañana con los suyos.\"",
        },
      ],
    },
    {
      id: "e3",
      chapter: "04:00 PM",
      title: "El informe post-mortem",
      text: [
        "Debes presentar el informe oficial de la caída al comité directivo de GlobalCorp.",
      ],
      choices: [
        {
          label: "Asumir la responsabilidad sin excusas y presentar un plan de prevención a 90 días",
          hint: "Liderazgo y responsabilidad profesional",
          effects: [{ stat: "sat", delta: 16 }, { stat: "pac", delta: 12 }, { stat: "cta", delta: 0 }],
          next: "END",
          result: "El directorio valora la honestidad técnica por encima de todo.",
        },
        {
          label: "Culpar a proveedores externos de infraestructura cloud",
          hint: "Excusas que proyectan debilidad",
          effects: [{ stat: "sat", delta: -12 }, { stat: "pac", delta: -10 }, { stat: "cta", delta: 0 }],
          next: "END",
          result: "\"No nos importan sus proveedores, nos importa su servicio\", responden secos.",
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
    "Simulador de resolución de crisis con clientes de alto valor. Desde cuentas VIP hasta incidentes Enterprise en Black Friday.",
  escenarioInicial: "vip",
  escenarios: [escenarioVIP, escenarioEnterprise],
};
