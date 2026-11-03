import type { GameData, Escenario } from "./types";

const escenarioVeronica: Escenario = {
  id: "veronica",
  titulo: "Negociación Maestra (Verónica Salas)",
  etiqueta: "Caso Clásico",
  contexto:
    "El contrato vale $120.000 anuales. Enfrente está Verónica Salas, directora de compras, que ha negociado con 40 vendedores este año y les ganó a 38. Tienes 5 rondas para cerrar sin regalar el margen.",
  inicio: "r1",
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
      prob: 0.35,
      texto: "A mitad de la negociación, Verónica recibe un mensaje en su portátil: un competidor menor bajó el precio un 40% de última hora.",
      efectos: [{ stat: "pal", delta: -12 }, { stat: "mar", delta: -8 }],
    },
    {
      id: "llamada-jefe",
      titulo: "Presión del Director Financiero",
      icono: "📞",
      prob: 0.3,
      texto: "Tu propio Director Financiero te llama por teléfono: 'No bajes del 50% de margen o prefiero perder el contrato'.",
      opciones: [
        {
          label: "Defender tu estrategia de valor ante tu jefe",
          hint: "Sostener criterio comercial",
          effects: [{ stat: "pal", delta: 10 }],
          resultado: "Convences a tu jefe de darte margen de maniobra.",
        },
        {
          label: "Ceder ante la presión interna y endurecerte con Verónica",
          hint: "Seguir la línea dura de la empresa",
          effects: [{ stat: "mar", delta: 12 }, { stat: "rel", delta: -10 }],
          resultado: "Te vuelves inflexible, lo que incomoda a Verónica.",
        },
      ],
    },
  ],
  escenas: [
    {
      id: "r1",
      chapter: "Ronda 1 de 5",
      title: "La apertura fría",
      text: [
        "Sala de directorios. Verónica ni te mira: revisa su teléfono.",
        "\"Tengo tres cotizaciones más baratas que la tuya. Convénceme en cinco minutos o esta puerta se cierra.\"",
        "Sabes que miente: tu servicio es el único certificado para su industria. Pero decirle 'usted miente' no abre puertas.",
      ],
      choices: [
        {
          label: "\"Le muestro la certificación que los otros tres no tienen\"",
          hint: "Diferenciación con hechos",
          effects: [
            { stat: "pal", delta: 18 },
            { stat: "rel", delta: 4 },
            { stat: "mar", delta: 0 },
          ],
          next: "r2",
          result: "Verónica suelta el teléfono. \"Bien. Al menos uno de los cuatro hizo la tarea.\"",
          flag: "certificacion-mostrada",
        },
        {
          label: "\"¿Cuánto más baratas? Yo igualo cualquiera de esas cifras\"",
          hint: "Regalar margen desde el minuto uno",
          effects: [
            { stat: "pal", delta: -20 },
            { stat: "rel", delta: 6 },
            { stat: "mar", delta: -22 },
          ],
          next: "r2",
          result: "\"Igualar no gana licitaciones. Perder margen las gana… para ti, mal.\" Anota algo en su cuaderno.",
          flag: "margen-regalado",
        },
        {
          label: "\"Antes de hablar de precio, cuénteme qué falló con su proveedor actual\"",
          hint: "Preguntas antes que discursos",
          effects: [
            { stat: "pal", delta: 10 },
            { stat: "rel", delta: 16 },
            { stat: "mar", delta: 0 },
          ],
          next: "r2",
          result: "Por primera vez te mira. \"…Nadie me había preguntado eso.\" Habla 7 minutos seguidos. Toma notas.",
          flag: "escucha-activa",
        },
      ],
    },
    {
      id: "r2",
      chapter: "Ronda 2 de 5",
      title: "El ancla agresiva",
      text: [
        "Verónica lanza su número: \"$84.000. Es lo que tengo presupuestado. Ese es el techo.\"",
        "Tu lista vale $120.000. El ancla está a 30% de distancia. La forma en que respondas define todo el terreno de juego.",
      ],
      choices: [
        {
          label: "\"Mi propuesta es $120.000. Le explico por qué cada dólar está ahí\"",
          hint: "Re-anclar con firmeza",
          effects: [
            { stat: "pal", delta: 14 },
            { stat: "rel", delta: -6 },
            { stat: "mar", delta: 14 },
          ],
          next: "r3",
          result: "Frunce el ceño. \"Tienes agallas para mantener el precio. Veamos si el producto lo vale.\"",
        },
        {
          label: "\"Podríamos cerrar en $105.000 si firmamos por tres años hoy\"",
          hint: "Concesión inteligente a cambio de volumen",
          effects: [
            { stat: "pal", delta: 6 },
            { stat: "rel", delta: 12 },
            { stat: "mar", delta: 4 },
          ],
          next: "r3",
          result: "\"Tres años es compromiso a largo plazo… me interesa el volumen.\"",
        },
        {
          label: "\"De acuerdo, aceptamos los $84.000 para cerrar rápido\"",
          hint: "Ceder sin contrapartida",
          effects: [
            { stat: "pal", delta: -22 },
            { stat: "rel", delta: 4 },
            { stat: "mar", delta: -25 },
          ],
          next: "r3",
          result: "\"Perfecto.\" Su sonrisa te hace sospechar que regalaste demasiado.",
        },
      ],
    },
    {
      id: "r3",
      chapter: "Ronda 3 de 5",
      title: "La objeción oculta",
      text: [
        "\"El precio me cuadra, pero mi equipo técnico dice que su integración toma dos meses y medio. Eso destruye nuestro cronograma.\"",
        "Es un punto crítico de fricción.",
      ],
      choices: [
        {
          label: "\"Asignamos un ingeniero senior dedicado exclusivamente a su integración en 3 semanas\"",
          hint: "Aportar recursos propios",
          effects: [
            { stat: "pal", delta: 12 },
            { stat: "rel", delta: 14 },
            { stat: "mar", delta: -6 },
          ],
          next: "r4",
          result: "\"Eso sí cambia las cosas. ¿Ingeniero dedicado? Muy buen punto.\"",
        },
        {
          label: "\"Nuestra documentación estándar es excelente, su equipo puede hacerlo solo\"",
          hint: "Evasiva técnica",
          effects: [
            { stat: "pal", delta: -10 },
            { stat: "rel", delta: -14 },
            { stat: "mar", delta: 0 },
          ],
          next: "r4",
          result: "\"Su documentación no escribe código por nosotros\", responde fría.",
        },
        {
          label: "\"Ofrecemos un sandbox gratuito y capacitación express para acelerar el despliegue\"",
          hint: "Compromiso equilibrado",
          effects: [
            { stat: "pal", delta: 6 },
            { stat: "rel", delta: 10 },
            { stat: "mar", delta: 0 },
          ],
          next: "r4",
          result: "\"Aceptable. Si la capacitación funciona, el tiempo se reduce.\"",
        },
      ],
    },
    {
      id: "r4",
      chapter: "Ronda 4 de 5",
      title: "La prueba de fuerza",
      text: [
        "\"Quiero cláusula de salida sin penalización a los 6 meses si las métricas no suben un 15%.\"",
        "Verónica busca transferir todo el riesgo comercial de su lado al tuyo.",
      ],
      choices: [
        {
          label: "\"Acepto la cláusula si medimos el éxito con KPIs conjuntos acordados por escrito\"",
          hint: "Compartir el riesgo con método",
          effects: [
            { stat: "pal", delta: 10 },
            { stat: "rel", delta: 12 },
            { stat: "mar", delta: 4 },
          ],
          next: "r5",
          result: "\"Me parece justo. Si cumplimos los KPIs, nos quedamos todos felices.\"",
        },
        {
          label: "\"Imposible. Nuestras políticas prohíben cláusulas de salida anticipada\"",
          hint: "Negativa rígida",
          effects: [
            { stat: "pal", delta: 4 },
            { stat: "rel", delta: -16 },
            { stat: "mar", delta: 0 },
          ],
          next: "r5",
          result: "\"Las políticas de su empresa no mandan en mi presupuesto.\"",
        },
        {
          label: "\"Acepto sin condiciones la cláusula a los 6 meses para destrabar el acuerdo\"",
          hint: "Ceder en el riesgo final",
          effects: [
            { stat: "pal", delta: -14 },
            { stat: "rel", delta: 8 },
            { stat: "mar", delta: -10 },
          ],
          next: "r5",
          result: "Asiente. \"Tienes confianza en tu producto, eso es bueno.\"",
        },
      ],
    },
    {
      id: "r5",
      chapter: "Ronda 5 de 5",
      title: "La firma",
      text: [
        "Verónica se levanta, camina a la ventana y da la espalda.",
        "\"Última palabra. Dímela y firmamos — o te vas por esa puerta con un 'lo pensaremos'.\"",
        "Todo lo que hiciste en 4 rondas converge en esta frase.",
      ],
      choices: [
        {
          label: "\"Firmemos. Y en 90 días le muestro números que justifiquen cada peso\"",
          hint: "Confianza con plazo verificable",
          effects: [
            { stat: "rel", delta: 12 },
            { stat: "mar", delta: 0 },
            { stat: "pal", delta: 0 },
          ],
          next: "END",
          result: "Verónica se gira. \"Los que prometen números y los entregan son raros. Firmemos.\"",
        },
        {
          label: "\"Usted sabe lo que vale. Yo sé lo que necesito. Firme cuando quiera\"",
          hint: "Poder silencioso: disposición a caminar",
          effects: [
            { stat: "rel", delta: 6 },
            { stat: "mar", delta: 6 },
            { stat: "pal", delta: 8 },
          ],
          next: "END",
          result: "\"…Tienes 24 horas para enviar el contrato.\" Es su forma de decir que ganaste.",
        },
        {
          label: "\"Un último gesto de mi parte y cerramos hoy mismo\"",
          hint: "Ceder al final para asegurar",
          effects: [
            { stat: "rel", delta: 10 },
            { stat: "mar", delta: -10 },
            { stat: "pal", delta: -6 },
          ],
          next: "END",
          result: "\"Acepto tu gesto.\" Firma. El contrato es real, aunque costó más de lo que querías admitir.",
        },
      ],
    },
  ],
  finales: [
    {
      id: "legend",
      rank: "S",
      title: "Maestra de la negociación",
      conditions: [{ stat: "rel", min: 74 }, { stat: "mar", min: 62 }, { stat: "pal", min: 62 }],
      text: "Contrato firmado en término medio alto, relación intacta y palanca para renovaciones. Verónica te recomienda personalmente en su gremio: \"El único vendedor que negoció como partner, no como suplicante.\" Los próximos 3 contratos llegan por su referral.",
    },
    {
      id: "great",
      rank: "A",
      title: "Cierre profesional",
      conditions: [{ stat: "rel", min: 58 }, { stat: "mar", min: 46 }],
      text: "Firmaste con margen razonable y una relación que sobrevivirá la primera crisis. Verónica te respeta: \"Trabajable\", dijo de ti, que en su idioma equivale a elogio. Renovación probable en 12 meses.",
    },
    {
      id: "ok",
      rank: "B",
      title: "Contrato con arañazos",
      conditions: [{ stat: "rel", min: 44 }],
      text: "El contrato es tuyo, pero pagaste caro cada punto de relación o margen. La operación será rentable… apenas. Lección clave: cada concesión rápida de las primeras rondas la pagaste completa al final.",
    },
    {
      id: "lost",
      rank: "D",
      title: "\"Lo pensaremos\"",
      text: "La frase que en compras significa no. Verónica cerró con tu competidor por $91.000. Revisa tus rondas: ceder sin exigir nada a cambio no construye relación — construye desprecio. La próxima vez, cada concesión se compra, nunca se regala.",
    },
  ],
};

const escenarioLicitacion: Escenario = {
  id: "licitacion",
  titulo: "Licitación Pública (B2G)",
  etiqueta: "Modo Licitación",
  contexto:
    "Te enfrentas a una licitación de software gubernamental por $300.000. Las reglas son estrictas, el comité de adjudicación es imparcial y cada coma en la propuesta cuenta.",
  inicio: "l1",
  stats: [
    { key: "rel", label: "Relación", icon: "🤝", max: 100 },
    { key: "mar", label: "Margen", icon: "📈", max: 100 },
    { key: "pal", label: "Palanca", icon: "⚔️", max: 100 },
  ],
  eventos: [
    {
      id: "observacion-legal",
      titulo: "Impugnación de Bases",
      icono: "⚖️",
      prob: 0.4,
      texto: "Un competidor impugna las bases de la licitación alegando requisitos direccionados.",
      efectos: [{ stat: "pal", delta: -10 }, { stat: "rel", delta: -5 }],
    },
  ],
  escenas: [
    {
      id: "l1",
      chapter: "Fase 1 · Antecedentes",
      title: "La admisibilidad",
      text: [
        "El comité de compras públicas publica los pliegos. Un pequeño error en el formulario de garantías notariales puede dejarte fuera sin derecho a apelación.",
      ],
      choices: [
        {
          label: "Revisar los documentos tres veces con asesoría legal externa",
          hint: "Cero margen de error formal",
          effects: [{ stat: "pal", delta: 15 }, { stat: "mar", delta: -5 }, { stat: "rel", delta: 5 }],
          next: "l2",
          result: "Admisibilidad aprobada sin observaciones. Eres uno de los 3 finalistas.",
        },
        {
          label: "Presentar el formato estándar anterior de prisa para ganar tiempo",
          hint: "Riesgo legal alto",
          effects: [{ stat: "pal", delta: -20 }, { stat: "mar", delta: 0 }, { stat: "rel", delta: -10 }],
          next: "l2",
          result: "El comité observa un timbre vencido. Te salvas por un tecnicismo pero pierdes puntos de confianza.",
        },
      ],
    },
    {
      id: "l2",
      chapter: "Fase 2 · Evaluación técnica",
      title: "La defensa de propuesta",
      text: [
        "El comité técnico te convoca a una sesión de preguntas y respuestas sobre ciberseguridad y soberanía de datos.",
      ],
      choices: [
        {
          label: "Llevar al CTO a la audiencia y demostrar arquitectura en servidores locales",
          hint: "Solidez técnica indiscutible",
          effects: [{ stat: "pal", delta: 20 }, { stat: "mar", delta: 0 }, { stat: "rel", delta: 12 }],
          next: "l3",
          result: "El comité técnico ovaciona la arquitectura propuesta.",
        },
        {
          label: "Enviar un video pregrabado con respuestas generales",
          hint: "Falta de compromiso presencial",
          effects: [{ stat: "pal", delta: -10 }, { stat: "mar", delta: 0 }, { stat: "rel", delta: -15 }],
          next: "l3",
          result: "El comité considera que faltó profundidad en las respuestas.",
        },
      ],
    },
    {
      id: "l3",
      chapter: "Fase 3 · Adjudicación",
      title: "La apertura de sobres económicos",
      text: [
        "Se abren las ofertas económicas. Tu propuesta está 12% por encima del presupuesto referencial del Estado, pero incluye soporte 24/7.",
      ],
      choices: [
        {
          label: "Argumentar valor social y continuidad operativa superior para justificar el precio",
          hint: "Venta de valor institucional",
          effects: [{ stat: "pal", delta: 12 }, { stat: "mar", delta: 10 }, { stat: "rel", delta: 10 }],
          next: "END",
          result: "El comité valora el impacto a largo plazo y adjudica a tu favor.",
        },
        {
          label: "Ofrecer rebaja de último minuto por carta notarial",
          hint: "Desesperación que rompe reglas de licitación",
          effects: [{ stat: "pal", delta: -25 }, { stat: "mar", delta: -20 }, { stat: "rel", delta: -20 }],
          next: "END",
          result: "La ley de compras públicas prohíbe modificar ofertas tras la apertura. Quedas descalificado.",
        },
      ],
    },
  ],
  finales: [
    {
      id: "lic-best",
      rank: "S",
      title: "Adjudicación Pública",
      conditions: [{ stat: "pal", min: 65 }, { stat: "rel", min: 55 }],
      text: "Licitación ganada por mérito técnico y legal. El Estado firma el contrato por $300.000 y te posiciona como referente en tecnología gubernamental.",
    },
    {
      id: "lic-bad",
      rank: "D",
      title: "Descalificado por forma",
      text: "Los errores formales o la falta de rigor técnico impidieron ganar el contrato. En compras públicas, el diablo está en los detalles.",
    },
  ],
};

export const negociacion: GameData = {
  slug: "negociacion",
  title: "Negociación Maestra",
  tagline: "Un contrato. Cinco rondas. Una sola oportunidad.",
  icon: "🤝",
  category: "Ventas",
  difficulty: 3,
  minutes: 8,
  accent: "#C084FC",
  imagen: "/img/negociacion.jpg",
  description:
    "Simuladores de negociación compleja. Desde contratos corporativos de alto margen con Verónica Salas hasta licitaciones públicas B2G.",
  escenarioInicial: "veronica",
  escenarios: [escenarioVeronica, escenarioLicitacion],
};
