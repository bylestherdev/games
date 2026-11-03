import type { GameData } from "./types";

export const negociacion: GameData = {
  slug: "negociacion",
  title: "Negociación Maestra",
  tagline: "Un contrato. Cinco rondas. Una sola oportunidad.",
  icon: "🤝",
  category: "Ventas",
  difficulty: 3,
  minutes: 8,
  accent: "#C084FC",
  description:
    "El contrato vale $120.000 anuales. Enfrente está Verónica Salas, directora de compras, que ha negociado con 40 vendedores este año y les ganó a 38. Tienes 5 rondas para cerrar sin regalar el margen.",
  stats: [
    { key: "rel", label: "Relación", icon: "🤝", max: 100 },
    { key: "mar", label: "Margen", icon: "📈", max: 100 },
    { key: "pal", label: "Palanca", icon: "⚔️", max: 100 },
  ],
  start: "r1",
  scenes: [
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
            { stat: "mar", delta: 10 },
          ],
          next: "r3",
          result: "\"Me gusta la firmeza. No me gusta la terquedad. Avancemos y veamos quién mueve primero.\"",
        },
        {
          label: "Buscar el punto medio de inmediato: \"$102.000 y cerramos\"",
          hint: "Concesión rápida, señal de debilidad",
          effects: [
            { stat: "pal", delta: -14 },
            { stat: "rel", delta: 8 },
            { stat: "mar", delta: -12 },
          ],
          next: "r3",
          result: "Verónica sonríe. \"Si moviste $18.000 en un minuto, ¿cuánto moverás en una hora?\" Presiona más.",
        },
        {
          label: "\"El presupuesto es $84.000… ¿con qué alcance? Separemos lo esencial de lo deseable\"",
          hint: "Cambiar el juego: alcance vs precio",
          effects: [
            { stat: "pal", delta: 8 },
            { stat: "rel", delta: 14 },
            { stat: "mar", delta: 4 },
          ],
          next: "r3",
          result: "\"Ahora hablamos en serio.\" Juntos arman dos paquetes: esencial $84.000, completo $120.000.",
        },
      ],
    },
    {
      id: "r3",
      chapter: "Ronda 3 de 5",
      title: "El buen policía",
      text: [
        "Cambia el tono: \"Escucha, te voy a ayudar. Si firmas HOY te consigo el OK con el CFO. Es mi palabra.\"",
        "La urgencia artificial. El clásico. Pero también es cierto que su ventana de firma es esta semana.",
      ],
      choices: [
        {
          label: "\"Valoro la ayuda. Mi contrapropuesta: firmo hoy si el contrato es de 24 meses\"",
          hint: "Condiciones por descuento",
          effects: [
            { stat: "pal", delta: 10 },
            { stat: "rel", delta: 10 },
            { stat: "mar", delta: 8 },
          ],
          next: "r4",
          result: "\"Negocio de adulto: yo te doy velocidad, tú me das permanencia. Lo llevo al CFO.\"",
        },
        {
          label: "\"Firmo hoy, tal cual, con la lista completa de $120.000\"",
          hint: "Exigir la urgencia SIN regalar nada",
          effects: [
            { stat: "pal", delta: 6 },
            { stat: "rel", delta: -10 },
            { stat: "mar", delta: 14 },
          ],
          next: "r4",
          result: "\"¿Todo el riesgo es mío y toda la ganancia tuya?\" Verónica se enfría. La sala también.",
        },
        {
          label: "\"¿Qué obtiene ELLA si firmo hoy? Hablemos de sus incentivos\"",
          hint: "Negociar con la persona, no con el puesto",
          effects: [
            { stat: "pal", delta: 4 },
            { stat: "rel", delta: 18 },
            { stat: "mar", delta: 0 },
          ],
          next: "r4",
          result: "Verónica guarda silencio… y luego admite: \"Si cierro esta semana, quedo bien con la gerencia. Tú me caes bien. Ayúdame a ayudarte.\"",
        },
      ],
    },
    {
      id: "r4",
      chapter: "Ronda 4 de 5",
      title: "El ultimátum",
      text: [
        "El CFO rechaza el paquete completo. Verónica regresa con la cifra final: \"$96.000. Ni un peso más, ni una semana más de espera.\"",
        "Tu margen aceptable llega hasta $104.000. Puedes aceptar, empatar, o arriesgarte.",
      ],
      choices: [
        {
          label: "Aceptar $96.000: contrato asegurado, margen sano",
          hint: "Cierre seguro",
          effects: [
            { stat: "pal", delta: -6 },
            { stat: "rel", delta: 10 },
            { stat: "mar", delta: -8 },
          ],
          next: "r5",
          result: "\"Aceptado. Prepararé la minuta.\" Apretón de manos firme. El trato está virtualmente cerrado.",
        },
        {
          label: "\"$100.000 y me comprometo a soporte prioritario por 12 meses\"",
          hint: "Empatar con valor agregado",
          effects: [
            { stat: "pal", delta: 2 },
            { stat: "rel", delta: 6 },
            { stat: "mar", delta: 2 },
          ],
          next: "r5",
          result: "\"Soporte prioritario… eso vale mi tiempo.\" Verónica duda tres segundos: \"Lleva la propuesta al CFO tú mismo.\"",
        },
        {
          label: "\"No puedo bajar de $104.000. Es lo que sostiene el servicio que usted necesita\"",
          hint: "Límite firme: alto riesgo, alta recompensa",
          effects: [
            { stat: "pal", delta: 12 },
            { stat: "rel", delta: -14 },
            { stat: "mar", delta: 10 },
          ],
          next: "r5",
          result: "Silencio largo. \"Eres el primer vendedor en un año que me dice que no. No sé si felicitarte o echarte.\"",
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
  endings: [
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