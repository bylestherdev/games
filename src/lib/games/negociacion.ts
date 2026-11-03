import type { GameData, Escenario } from "./types";

const escenarioVeronica: Escenario = {
  id: "veronica",
  titulo: "Negociación Maestra (Verónica Salas)",
  etiqueta: "Caso Clásico (Multiruta)",
  contexto:
    "El contrato vale $120.000 anuales. Enfrente está Verónica Salas, directora de compras, que ha negociado con 40 vendedores este año y les ganó a 38. Múltiples rutas y opciones de decisión.",
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
      prob: 0.25,
      unaVez: true,
      texto: "Un competidor menor bajó el precio un 40% de última hora y Verónica lo menciona sobre la mesa.",
      efectos: [{ stat: "pal", delta: -10 }, { stat: "mar", delta: -8 }],
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
      ],
      choices: [
        {
          label: "\"Le muestro la certificación oficial que los otros tres no tienen\"",
          hint: "Diferenciación con hechos técnicos",
          effects: [{ stat: "pal", delta: 18 }, { stat: "rel", delta: 4 }, { stat: "mar", delta: 0 }],
          next: "r2_tecnica",
          result: "Verónica suelta el teléfono. \"Bien. Al menos uno hizo la tarea.\"",
          flag: "ruta-tecnica",
        },
        {
          label: "\"¿Cuánto más baratas? Yo igualo cualquiera de esas cifras hoy mismo\"",
          hint: "Regalar margen desde el minuto uno",
          effects: [{ stat: "pal", delta: -20 }, { stat: "rel", delta: 6 }, { stat: "mar", delta: -22 }],
          next: "r2_precio",
          result: "\"Igualar no gana licitaciones. Perder margen las gana… para ti, mal.\"",
          flag: "ruta-precio",
        },
        {
          label: "\"Antes de hablar de precio, cuénteme qué falló con su proveedor actual\"",
          hint: "Preguntas de descubrimiento y escucha activa",
          effects: [{ stat: "pal", delta: 10 }, { stat: "rel", delta: 16 }, { stat: "mar", delta: 0 }],
          next: "r2_descubrimiento",
          result: "Por primera vez te mira. \"…Nadie me había preguntado eso.\"",
          flag: "ruta-descubrimiento",
        },
      ],
    },
    // Ruta Técnica
    {
      id: "r2_tecnica",
      chapter: "Ronda 2 · Camino Técnico",
      title: "Prueba de Integración",
      text: [
        "\"Me gusta su certificación, pero mi CTO insiste en que requiere migrar bases de datos completas, lo cual toma meses\".",
      ],
      choices: [
        {
          label: "Ofrecer conector nativo sin migración de BD",
          hint: "Innovación de producto",
          effects: [{ stat: "pal", delta: 14 }, { stat: "rel", delta: 10 }, { stat: "mar", delta: 4 }],
          next: "r3_convergencia",
          result: "\"Eso elimina nuestro mayor cuello de botella técnico.\"",
        },
        {
          label: "Insistir en que la migración completa es obligatoria por seguridad",
          hint: "Rigidez técnica",
          effects: [{ stat: "pal", delta: 4 }, { stat: "rel", delta: -10 }, { stat: "mar", delta: 0 }],
          next: "r3_convergencia",
          result: "\"Entonces tendremos que evaluarlo con calma el próximo año.\"",
        },
      ],
    },
    // Ruta Precio
    {
      id: "r2_precio",
      chapter: "Ronda 2 · Camino de Precio",
      title: "La Sábana Corta",
      text: [
        "Como aceptaste igualar precios de inmediato, Verónica ahora va por todo: exige soporte 24/7 incluido sin costo adicional.",
      ],
      choices: [
        {
          label: "Aceptar el soporte 24/7 gratis para no perder el contrato",
          hint: "Ceder en todo",
          effects: [{ stat: "pal", delta: -15 }, { stat: "rel", delta: 4 }, { stat: "mar", delta: -18 }],
          next: "r3_convergencia",
          result: "\"Trato hecho\", sonríe. Tu margen queda pulverizado.",
        },
        {
          label: "Poner límite: el soporte 24/7 tiene un fee preferencial, no es gratuito",
          hint: "Plantarse tarde",
          effects: [{ stat: "pal", delta: 8 }, { stat: "rel", delta: -4 }, { stat: "mar", delta: 6 }],
          next: "r3_convergencia",
          result: "\"Debiste avisar antes\", murmura molesta.",
        },
      ],
    },
    // Ruta Descubrimiento
    {
      id: "r2_descubrimiento",
      chapter: "Ronda 2 · Camino Consultivo",
      title: "Alineación de Dolor",
      text: [
        "Verónica te confiesa que su proveedor anterior colapsó por mala atención en fechas clave. Busca un partner confiable más que un software barato.",
      ],
      choices: [
        {
          label: "Proponer un modelo de contrato basado en éxito compartido y SLAs estrictos",
          hint: "Asociación estratégica",
          effects: [{ stat: "pal", delta: 16 }, { stat: "rel", delta: 18 }, { stat: "mar", delta: 6 }],
          next: "r3_convergencia",
          result: "\"Nadie me había propuesto ganar solo si nosotros ganamos. Me gusta.\"",
        },
        {
          label: "Ofrecer un descuento estándar del 10% por pago adelantado",
          hint: "Volver al terreno transaccional",
          effects: [{ stat: "pal", delta: 2 }, { stat: "rel", delta: 6 }, { stat: "mar", delta: -6 }],
          next: "r3_convergencia",
          result: "\"El dinero por adelantado no resuelve nuestros problemas operativos.\"",
        },
      ],
    },
    {
      id: "r3_convergencia",
      chapter: "Ronda Final · La Firma",
      title: "El Cierre de Negociación",
      text: [
        "Llegamos al momento de la verdad. Verónica pone el documento sobre el escritorio y espera tu última palabra.",
      ],
      choices: [
        {
          label: "Firmar en los términos acordados y estrechar su mano con firmeza",
          hint: "Cierre profesional",
          effects: [],
          next: "END",
          result: "Evaluando resultado de la negociación...",
        },
      ],
    },
  ],
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
      title: "\"Lo pensaremos\"",
      text: "La negociación fracasó o cediste tanto margen que el contrato ya no era rentable.",
    },
  ],
};

const escenarioLicitacion: Escenario = {
  id: "licitacion",
  titulo: "Licitación Pública (B2G)",
  etiqueta: "Modo Licitación (Multiruta)",
  contexto:
    "Licitación de software gubernamental por $300.000. Reglas estrictas y múltiples rutas de postulación.",
  inicio: "l1",
  stats: [
    { key: "rel", label: "Relación", icon: "🤝", max: 100 },
    { key: "mar", label: "Margen", icon: "📈", max: 100 },
    { key: "pal", label: "Palanca", icon: "⚔️", max: 100 },
  ],
  eventos: [
    {
      id: "observacion-legal",
      titulo: "Impugnación",
      icono: "⚖️",
      prob: 0.25,
      unaVez: true,
      texto: "Un competidor impugna las bases.",
      efectos: [{ stat: "pal", delta: -10 }],
    },
  ],
  escenas: [
    {
      id: "l1",
      chapter: "Fase 1",
      title: "Admisibilidad",
      text: ["Selecciona tu estrategia legal y técnica para los pliegues de la licitación pública."],
      choices: [
        {
          label: "Auditoría legal exhaustiva con 3 abogados externos",
          hint: "Cero errores formales",
          effects: [{ stat: "pal", delta: 15 }, { stat: "mar", delta: -5 }],
          next: "l2_tecnica",
          result: "Pliegos impecables aprobados de inmediato.",
        },
        {
          label: "Uso de plantilla genérica propia para postular rápido",
          hint: "Riesgo formal",
          effects: [{ stat: "pal", delta: -15 }, { stat: "mar", delta: 0 }],
          next: "l2_tecnica",
          result: "Observaciones menores del comité que debes subsanar.",
        },
      ],
    },
    {
      id: "l2_tecnica",
      chapter: "Fase 2",
      title: "Defensa Técnica",
      text: ["El comité evalúa la propuesta de seguridad informática."],
      choices: [
        {
          label: "Demostración en vivo de ciberseguridad con hackeo ético controlado",
          hint: "Demostración de alto impacto",
          effects: [{ stat: "pal", delta: 18 }, { stat: "rel", delta: 10 }],
          next: "l3_fin",
          result: "El comité queda impresionado por el nivel técnico.",
        },
        {
          label: "Presentación en PDF estándar de 150 páginas",
          hint: "Formato tradicional aburrido",
          effects: [{ stat: "pal", delta: 2 }, { stat: "rel", delta: 0 }],
          next: "l3_fin",
          result: "Evaluación técnica aprobada por los pelos.",
        },
      ],
    },
    {
      id: "l3_fin",
      chapter: "Fase 3",
      title: "Adjudicación Final",
      text: ["Cierre del proceso licitatorio."],
      choices: [
        {
          label: "Ver adjudicación final",
          hint: "Cierre",
          effects: [],
          next: "END",
          result: "Calculando resultados de la licitación B2G...",
        },
      ],
    },
  ],
  finales: [
    {
      id: "lic-best",
      rank: "S",
      title: "Adjudicación Pública",
      conditions: [{ stat: "pal", min: 60 }],
      text: "Licitación ganada con éxito. Contrato adjudicado por $300.000.",
    },
    {
      id: "lic-bad",
      rank: "D",
      title: "Descalificado",
      text: "No superaste las exigencias rigurosas del proceso público.",
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
    "Simuladores de negociación compleja con múltiples rutas de decisión y eventos sorpresa.",
  escenarioInicial: "veronica",
  escenarios: [escenarioVeronica, escenarioLicitacion],
};
