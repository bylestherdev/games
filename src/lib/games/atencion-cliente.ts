import type { GameData } from "./types";

export const atencionCliente: GameData = {
  slug: "atencion-cliente",
  title: "Atención al Cliente Premium",
  tagline: "Cada mensaje puede salvar… o perder la cuenta.",
  icon: "🎧",
  category: "Servicio",
  difficulty: 2,
  minutes: 6,
  accent: "#D946EF",
  description:
    "Eres agente senior de la cuenta más importante de la empresa. Ana Rojas, cliente VIP con $48.000 facturados este año, acaba de escribir un mensaje que puede terminar todo. Tú respondes.",
  stats: [
    { key: "sat", label: "Satisfacción", icon: "😊", max: 100 },
    { key: "pac", label: "Paciencia", icon: "⏳", max: 100 },
    { key: "cta", label: "Valor de cuenta", icon: "💰", max: 60000, initial: 48000, format: "money" },
  ],
  start: "s1",
  scenes: [
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
            { stat: "sat", delta: 18 },
            { stat: "pac", delta: 20 },
            { stat: "cta", delta: -900 },
          ],
          next: "s3",
          result: "El courier sale en 25 minutos. Ana recibe el tracking con una hora de anticipación a su deadline.",
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
          result: "Ana: \"¿Esperar? Mi negocio no puede esperar. ¿Ustedes sí?\"",
        },
        {
          label: "Ofrecer envío parcial: lo urgente hoy, el resto el lunes",
          hint: "Solución creativa de bajo costo",
          effects: [
            { stat: "sat", delta: 10 },
            { stat: "pac", delta: 12 },
            { stat: "cta", delta: -300 },
          ],
          next: "s3",
          result: "Ana evalúa: \"Al menos alguien pensó en mi lanzamiento y no solo en el flete.\"",
        },
      ],
    },
    {
      id: "s3",
      chapter: "10:30 AM",
      title: "La conversación incómoda",
      text: [
        "Ana escribe: \"Esto no es solo el pedido. Me siento abandonada. Llevo 3 años con ustedes y nadie me llama nunca.\"",
        "Es el momento de hablar de la relación, no del paquete.",
      ],
      choices: [
        {
          label: "Reconocer el abandono y proponer un plan de seguimiento trimestral",
          hint: "Honestidad + compromiso",
          effects: [
            { stat: "sat", delta: 20 },
            { stat: "pac", delta: 10 },
            { stat: "cta", delta: 0 },
          ],
          next: "s4",
          result: "\"…Está bien. Quiero ver ese plan. Si vuelve a pasar esto, no hay tercera vez.\"",
        },
        {
          label: "Enfocarte en cerrar la venta de upselling mientras está caliente",
          hint: "Oportunidad comercial… arriesgada",
          effects: [
            { stat: "sat", delta: -16 },
            { stat: "pac", delta: -12 },
            { stat: "cta", delta: 2200 },
          ],
          next: "s4",
          result: "Ana acepta el add-on por impulso… pero su confianza en ustedes queda tocada.",
        },
        {
          label: "Escalar a tu gerente para que ella reciba una disculpa formal de la empresa",
          hint: "Gesto institucional",
          effects: [
            { stat: "sat", delta: 12 },
            { stat: "pac", delta: -6 },
            { stat: "cta", delta: 0 },
          ],
          next: "s4",
          result: "La llamada del gerente llega a las 12:00. Ana valora el gesto, aunque nota que tú te quitaron el peso de encima.",
        },
      ],
    },
    {
      id: "s4",
      chapter: "03:00 PM",
      title: "La prueba de fuego",
      text: [
        "El courier llama: hay restricciones de tránsito. La entrega llegará mañana 8 AM, no hoy a las 6 PM como prometiste.",
        "Ana tiene su lanzamiento el viernes. La promesa que hiciste se rompe. ¿Qué haces?",
      ],
      choices: [
        {
          label: "Llamarle ANTES de que ella lo descubra, con plan B incluido",
          hint: "Adelantarse al problema",
          effects: [
            { stat: "sat", delta: 14 },
            { stat: "pac", delta: 8 },
            { stat: "cta", delta: -500 },
          ],
          next: "s5",
          result: "\"Me avisaste antes de que preguntara. Eso no lo hace nadie. Escucho tu plan B.\"",
        },
        {
          label: "Esperar y esperar que el courier cumpla de todos modos",
          hint: "Apuestas a la suerte",
          effects: [
            { stat: "sat", delta: -20 },
            { stat: "pac", delta: -22 },
            { stat: "cta", delta: 0 },
          ],
          next: "s5",
          result: "A las 8 PM Ana descubre el retraso sola. \"¿Otra vez tengo que ser yo quien pregunte?\"",
        },
        {
          label: "Ofrecer compensación en servicios por el mal rato",
          hint: "Reconocer el costo para su negocio",
          effects: [
            { stat: "sat", delta: 8 },
            { stat: "pac", delta: 4 },
            { stat: "cta", delta: -1200 },
          ],
          next: "s5",
          result: "Ana: \"El gesto lo noto. Pero necesito respuestas, no cupones.\"",
        },
      ],
    },
    {
      id: "s5",
      chapter: "06:45 PM",
      title: "El cierre del día",
      text: [
        "Ana escribe por última vez hoy: \"Mañana sé si sigo con ustedes o me voy con la competencia. Te dejo la decisión a ti, agenta.\"",
        "Una última jugada. La que define todo el día.",
      ],
      choices: [
        {
          label: "Enviar un resumen honesto: qué falló, qué hiciste, qué cambia desde mañana",
          hint: "Transparencia radical",
          effects: [
            { stat: "sat", delta: 18 },
            { stat: "pac", delta: 12 },
            { stat: "cta", delta: 0 },
          ],
          next: "s6",
          result: "\"Tu resumen es más claro que todo lo que me mandó esta empresa en 3 años. Mañana hablamos.\"",
        },
        {
          label: "Ofrecer una reunión mañana contigo y tu gerente, con agenda formal",
          hint: "Compromiso estructural",
          effects: [
            { stat: "sat", delta: 12 },
            { stat: "pac", delta: 8 },
            { stat: "cta", delta: 0 },
          ],
          next: "s6",
          result: "\"Acepto la reunión. Veremos si las palabras se convierten en algo.\"",
        },
        {
          label: "Respetar su espacio: solo confirmar la entrega y despedirte con calidez",
          hint: "A veces menos es más",
          effects: [
            { stat: "sat", delta: 10 },
            { stat: "pac", delta: 16 },
            { stat: "cta", delta: 0 },
          ],
          next: "s6",
          result: "\"Gracias por no presionarme hoy. Eso también cuenta.\"",
        },
      ],
    },
    {
      id: "s6",
      chapter: "08:02 AM · Día siguiente",
      title: "El veredicto",
      text: [
        "Suena tu teléfono a primera hora. Es Ana.",
        "Lo que diga depende de todo lo que hiciste ayer.",
      ],
      choices: [],
    },
  ],
  endings: [
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
