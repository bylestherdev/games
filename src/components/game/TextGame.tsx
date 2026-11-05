"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Ending, GameData, GameEvent, Scene, Stat, Escenario } from "@/lib/games/types";
import {
  clearProgress,
  saveProgress,
  useSavedProgress,
  useProgresses,
  type DecisionLogEntry,
} from "@/lib/games/progress";
import {
  LOGROS,
  cumpleLogro,
  registrarLogros,
  registrarPartida,
  compartir,
  compartirTarjetaConTexto,
  linkWhatsApp,
  linkX,
  type LogroRegistrado,
} from "@/lib/games/achievements";

type Phase = "intro" | "scene" | "event" | "feedback" | "ending";

function initStats(stats: Stat[]): Record<string, number> {
  const s: Record<string, number> = {};
  for (const st of stats) s[st.key] = st.initial ?? Math.round(st.max * 0.5);
  return s;
}

function resolveEnding(endings: Ending[], stats: Record<string, number>): Ending {
  for (const e of endings) {
    if (!e.conditions || e.conditions.length === 0) return e;
    const ok = e.conditions.every((c) => {
      const v = stats[c.stat] ?? 0;
      if (c.min !== undefined && v < c.min) return false;
      if (c.max !== undefined && v > c.max) return false;
      return true;
    });
    if (ok) return e;
  }
  return endings[endings.length - 1];
}

function formatValue(st: Pick<Stat, "format">, value: number): string {
  const rounded = Math.round(value);
  return st.format === "money" ? `$${rounded.toLocaleString("es-CL")}` : `${rounded}`;
}

export default function TextGame({ game }: { game: GameData }) {
  const escenarios: Escenario[] =
    game.escenarios && game.escenarios.length > 0
      ? game.escenarios
      : [
          {
            id: "default",
            titulo: game.title,
            contexto: game.description,
            etiqueta: "Estándar",
            inicio: (game as unknown as { start?: string }).start ?? "s1",
            stats: (game as unknown as { stats?: Stat[] }).stats ?? [],
            escenas: (game as unknown as { scenes?: Scene[] }).scenes ?? [],
            eventos: [],
            finales: (game as unknown as { endings?: Ending[] }).endings ?? [],
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
          },
        ];

  const [escenarioId, setEscenarioId] = useState<string>(
    game.escenarioInicial || escenarios[0].id
  );
  const escenario = escenarios.find((e) => e.id === escenarioId) ?? escenarios[0];

  const savedProgresses = useProgresses(game.slug);
  const saved = useSavedProgress(game.slug, escenarioId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [sceneId, setSceneId] = useState(escenario.inicio);
  const [rondaActual, setRondaActual] = useState(() => {
    // Si el escenario tiene escenas estáticas, usarlas; sino iniciar sistema de rondas
    return escenario.escenas && escenario.escenas.length > 0 ? 0 : 1;
  });
  // Baraja dinámica con restricciones narrativas: apertura fija 1, cierre/alianza en 6-7, medio barajado
  const [poolBarajado, setPoolBarajado] = useState<string[]>(() => {
    if (escenario.escenas && escenario.escenas.length > 0) return [];
    const pool = escenario.poolRondasDisponibles ?? [
      "apertura", "investigacion", "tecnica", "precio", "contraoferta", "cierre", "alianza", "riesgo", "validacion", "sorpresa"
    ];
    // Filtrar solo los que existen en el pool del escenario
    const disponibles = pool.filter(t => pool.includes(t));
    // Fijos: apertura=1, cierre/alianza en 6-7
    const fijos = { 1: "apertura", 6: "cierre", 7: "alianza" };
    const medio = disponibles.filter(t => !Object.values(fijos).includes(t));
    // Barajar medio (Fisher-Yates)
    for (let i = medio.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [medio[i], medio[j]] = [medio[j], medio[i]];
    }
    // Construir pool final: [1] + medio[0-3] + [6,7]
    const resultado: string[] = [];
    resultado[0] = fijos[1];
    resultado[1] = medio[0];
    resultado[2] = medio[1];
    resultado[3] = medio[2];
    resultado[4] = medio[3];
    resultado[5] = fijos[6];
    resultado[6] = fijos[7];
    return resultado;
  });
  // El avance de ronda y sceneId se maneja síncronamente en avanzarDesdeFeedback
  // No se necesita useEffect adicional
  const [stats, setStats] = useState<Record<string, number>>(() => initStats(escenario.stats));
  const [log, setLog] = useState<DecisionLogEntry[]>([]);
  const [typed, setTyped] = useState(0);
  const [flags, setFlags] = useState<string[]>([]);
  const [eventosDisparados, setEventosDisparados] = useState<number>(0);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [pendingNextSceneId, setPendingNextSceneId] = useState<string>(escenario.inicio);
  const [eventResultText, setEventResultText] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    choiceIdx: number;
    deltas: { icon: string; label: string; delta: number; pct: number; money: boolean }[];
    result: string;
    nextSceneId: string;
    isEnd: boolean;
  } | null>(null);

  const [ending, setEnding] = useState<Ending | null>(null);
  const [shake, setShake] = useState(0);
  const [nuevosLogros, setNuevosLogros] = useState<LogroRegistrado[]>([]);
  const [compartidoMsg, setCompartidoMsg] = useState<string | null>(null);

  const shareCardRef = useRef<HTMLDivElement>(null);
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback de escena: si no hay escenas estáticas, generamos elecciones dinámicas según la ronda actual
  // Pool de rondas y elecciones dinámicas con sentido contextual para cada una de las 7 fases
  // Tipo de ronda actual desde la baraja barajada
  const rondaTipo = poolBarajado[rondaActual - 1] || "apertura";

  // Opciones contextuales según el tipo de ronda actual
  const getChoicesForRound = (tipo: string, stats: any[]) => {
    const s1 = stats[0]?.key || "rel";
    const s2 = stats[1]?.key || "mar";
    const s3 = stats[2]?.key || "pal";
    
    switch (tipo) {
      case "apertura":
        return [
          {
            label: "Establecer contacto directo y profesional",
            hint: "Rompes el hielo con firmeza. Ganás credibilidad inmediata pero revelás tu mano temprano.",
            effects: [{ stat: s1, delta: 8 }, { stat: s2, delta: -4 }, { stat: s3, delta: 3 }],
            result: "Verónica nota tu preparación. Te responde con respeto pero aprieta: 'Bien, empecemos por el precio base'. Ganaste Relación y Palanca, cediste Margen inicial.",
            next: "next"
          },
          {
            label: "Escuchar activamente y dejar que ella marque el tempo",
            hint: "Enfoque receptivo. Obtenés información valiosa pero cedés control de la agenda.",
            effects: [{ stat: s1, delta: 12 }, { stat: s2, delta: -6 }, { stat: s3, delta: -2 }],
            result: "Verónica se explaya 20 minutos. Revela que su mayor dolor es la implementación, no el precio. Ganaste mucha Relación, pero cediste Margen y Palanca al dejar que ella conduzca.",
            next: "next"
          },
          {
            label: "Presentar una propuesta agresiva de entrada (anchoring alto)",
            hint: "Golpe de efecto. Fijás el rango de negociación alto, pero arriesgás parecer inflexible.",
            effects: [{ stat: s1, delta: -8 }, { stat: s2, delta: 15 }, { stat: s3, delta: -5 }],
            result: "Verónica frunce el ceño: 'Ese número no es realista'. Lográs un Margen inicial alto, pero dañaste Relación y perdiste Palanca. Ahora tenés que recuperar confianza.",
            next: "next"
          },
        ];
      case "investigacion":
        return [
          {
            label: "Hacer preguntas profundas sobre dolores reales y criterios de decisión",
            hint: "Descubrís el 'por qué' real. Ganás intel crítica pero consumís tiempo de agenda.",
            effects: [{ stat: s1, delta: 10 }, { stat: s2, delta: -3 }, { stat: s3, delta: 5 }],
            result: "Descubrís que su mayor miedo es la migración de datos, no el precio. Ganás mucha Relación y Palanca, cedés algo de Margen por el tiempo invertido.",
            next: "next"
          },
          {
            label: "Analizar restricciones técnicas, legales y de presupuesto con su equipo",
            hint: "Auditoría técnica. Obtenés datos duros pero exponés complejidad que puede asustar.",
            effects: [{ stat: s1, delta: 3 }, { stat: s2, delta: 8 }, { stat: s3, delta: -4 }],
            result: "Descubrís que su migración requiere 6 meses, no 3. Ganás Margen al justificar precio premium, pero perdés Relación y Palanca al revelar complejidad.",
            next: "next"
          },
          {
            label: "Indagar experiencias previas con competidores para mapear debilidades",
            hint: "Inteligencia competitiva. Encontrás huecos pero arriesgás parecer obsesionado con otros.",
            effects: [{ stat: s1, delta: 6 }, { stat: s2, delta: 4 }, { stat: s3, delta: 6 }],
            result: "Confiesan que el proveedor actual falló en soporte post-venta. Ganás Palanca estratégica y Relación moderada, Margen ligero. Ahora sabés exactamente dónde golpear.",
            next: "next"
          },
        ];
      case "tecnica":
        return [
          {
            label: "Demostrar robustez arquitectónica, SLAs y garantías de migración",
            hint: "Argumento técnico sólido. Disipás dudas pero exponés complejidad operativa.",
            effects: [{ stat: s1, delta: 4 }, { stat: s2, delta: 8 }, { stat: s3, delta: 6 }],
            result: "El CTO asiente. Las dudas técnicas se disipan. Ganás Margen y Palanca técnica, Relación moderada. El precio premium se justifica solo.",
            next: "next"
          },
          {
            label: "Ofrecer personalización profunda a medida de sus flujos críticos",
            hint: "Ajuste perfecto. Flexibilidad que enamora pero compromete escalabilidad y margen.",
            effects: [{ stat: s1, delta: 10 }, { stat: s2, delta: -8 }, { stat: s3, delta: 3 }],
            result: "El equipo técnico aplaude. 'Finalmente alguien que entiende nuestros flujos'. Ganás Relación enorme, pero cedés Margen significativo y algo de Palanca por el scope creep implícito.",
            next: "next"
          },
          {
            label: "Simplificar enfocándote solo en ROI y tiempo a valor",
            hint: "Enfoque gerencial. Vendés resultado, no features. Arriesgás parecer superficial ante técnicos.",
            effects: [{ stat: s1, delta: 6 }, { stat: s2, delta: 5 }, { stat: s3, delta: 4 }],
            result: "El CFO sonríe. 'Por fin alguien que habla nuestro idioma'. Ganás Relación y Margen equilibrados, Palanca decente. Riesgo: el equipo técnico puede sentirse ignorado luego.",
            next: "next"
          },
        ];
      case "precio":
        return [
          {
            label: "Defender precio lista sin ceder: defender valor y ROI demostrado",
            hint: "Firmeza total. Protegé margen máximo pero arriesgás que se vayan a la competencia.",
            effects: [{ stat: s1, delta: -10 }, { stat: s2, delta: 18 }, { stat: s3, delta: -5 }],
            result: "Verónica aprieta: 'Es caro'. Te mantienes firme: 'El ROI lo paga en 4 meses'. Ganás Margen máximo, pero Relación y Palanca sufren fuerte. Es todo o nada.",
            next: "next"
          },
          {
            label: "Ofrecer descuento 8% condicionado a contrato 3 años + pago anual adelantado",
            hint: "Descuento condicionado. Cedés margen por compromiso largo y cashflow. Trade-off clásico.",
            effects: [{ stat: s1, delta: 6 }, { stat: s2, delta: -6 }, { stat: s3, delta: 8 }],
            result: "'3 años me da seguridad para aprobarlo interno'. Ganás Relación y Palanca enorme (compromiso largo), cedés Margen controlado. Cashflow asegurado.",
            next: "next"
          },
          {
            label: "Proponer pago por hitos: 30% inicio, 40% go-live, 30% a 90 días post-implementación",
            hint: "Pago por hitos. Reducís fricción financiera pero diluís valor presente y alargás cobro.",
            effects: [{ stat: s1, delta: 8 }, { stat: s2, delta: -4 }, { stat: s3, delta: -3 }],
            result: "'Ese esquema nos da aire para aprobarlo ya'. Ganás Relación y algo de Margen, perdés Palanca (pagos condicionados) y algo de Margen por riesgo de impago.",
            next: "next"
          },
        ];
      case "contraoferta":
        return [
          {
            label: "Recalibrar: pequeño descuento extra a cambio de firmar hoy",
            hint: "Cierre rápido. Cedés margen residual por cerrar ya. Riesgo: parecé desesperado.",
            effects: [{ stat: s1, delta: 3 }, { stat: s2, delta: -5 }, { stat: s3, delta: 4 }],
            result: "'Si firmamos hoy, 3% extra'. Aceptan. Ganás algo de Palanca y Relación, perdés Margen. Cierre rápido pero dejaste dinero en la mesa.",
            next: "next"
          },
          {
            label: "Contraponer: ampliar scope (módulo analytics + soporte 24/7) sin bajar precio",
            hint: "Valor agregado. Ampliás percepción de valor sin tocar precio. Requiere capacidad de entrega real.",
            effects: [{ stat: s1, delta: 8 }, { stat: s2, delta: 2 }, { stat: s3, delta: 6 }],
            result: "'Analytics incluido cambia la ecuación'. Aceptan precio original. Ganás Relación y Palanca fuerte, Margen casi intacto. Requiere que tu equipo entregue el extra prometido.",
            next: "next"
          },
          {
            label: "Plantarse: 'Este es mi límite. Si no cerramos aquí, nos vemos en la renovación'",
            hint: "Línea roja dura. Demostrás convicción. Arriesgás ruptura total. Solo si tenés BATNA fuerte.",
            effects: [{ stat: s1, delta: -6 }, { stat: s2, delta: 12 }, { stat: s3, delta: -8 }],
            result: "Silencio tenso. 30 segundos. 'De acuerdo. Firmamos tus términos'. Ganás Margen máximo y respeto (Palanca técnica), pero Relación dañada y Palanca relacional quemada. Riesgo alto de churn futuro.",
            next: "next"
          },
        ];
      case "cierre":
        return [
          {
            label: "Proponer firma digital hoy con fecha de go-live en 30 días",
            hint: "Cierre directo. Aterrizás compromiso ya. Arriesgás presión excesiva si no todo está listo.",
            effects: [{ stat: s1, delta: 4 }, { stat: s2, delta: 6 }, { stat: s3, delta: 5 }],
            result: "'Listo, firmemos'. Contrato firmado, go-live agendado. Ganás Margen decente, Relación y Palanca equilibradas. Cierre limpio.",
            next: "next"
          },
          {
            label: "Condicionar firma a piloto pagado de 60 días con criterios de éxito claros",
            hint: "Piloto pagado. Reducís riesgo para ellos, demostrás confianza. Alargás ciclo pero asegurás fit real.",
            effects: [{ stat: s1, delta: 10 }, { stat: s2, delta: -4 }, { stat: s3, delta: 6 }],
            result: "'Ese piloto nos da la seguridad que necesita el board'. Aceptan piloto pagado $15K. Ganás Relación y Palanca enorme, cedés Margen inicial. Pipeline real, no vaporware.",
            next: "next"
          },
          {
            label: "Sellar con resumen ejecutivo de valor, ROI proyectado y próximos pasos vinculantes",
            hint: "Consolidar pacto. Documentás valor acordado y compromisos mutuos. Profesional pero puede parecer burocrático.",
            effects: [{ stat: s1, delta: 6 }, { stat: s2, delta: 4 }, { stat: s3, delta: 8 }],
            result: "Documento firmado por ambas partes. 'Esto nos da trazabilidad interna'. Ganás Palanca documental fuerte, Relación y Margen decentes. Base sólida para renovación.",
            next: "next"
          },
        ];
      default:
        return [
          {
            label: "Proponer Joint Business Plan: co-marketing, roadmap compartido, revenue share",
            hint: "Alianza estratégica real. Inversión mutua alta. Requiere alineación ejecutiva real.",
            effects: [{ stat: s1, delta: 12 }, { stat: s2, delta: -6 }, { stat: s3, delta: 10 }],
            result: "'Hagámoslo juntos'. Plan conjunto firmado por ambos CEOs. Ganás Relación y Palanca máximas, cedés Margen por inversión conjunta. Pipeline futuro asegurado.",
            next: "next"
          },
          {
            label: "Definir SLA premium con penalties/bonuses + revisiones trimestrales de valor",
            hint: "Gobernanza profesional. Métricas claras, incentivos alineados. Requiere disciplina operativa.",
            effects: [{ stat: s1, delta: 6 }, { stat: s2, delta: 4 }, { stat: s3, delta: 8 }],
            result: "SLA firmado con bonuses por uptime/CSAT. Ganás Palanca de gobernanza y Margen decente, Relación profesional. Base para renovación automática.",
            next: "next"
          },
          {
            label: "Cerrar como proveedor preferente con first-right-of-refusal en nuevas verticales",
            hint: "Bloqueo competitivo. First-mover advantage en expansiones. Requiere confianza total.",
            effects: [{ stat: s1, delta: 8 }, { stat: s2, delta: 2 }, { stat: s3, delta: 6 }],
            result: "'Queremos que seáis nuestro partner por defecto'. First-right firmado. Ganás Relación y Palanca de bloqueo competitivo, Margen ligero. Moat defensivo creado.",
            next: "next"
          },
        ];
    }
  };

  const fallbackChoices = getChoicesForRound(rondaTipo, escenario.stats);

  const getRoundDetails = (rondaNum: number, contextoBase: string) => {
    const phaseTitles = [
      "Fase 1: Toma de Contacto y Apertura",
      "Fase 2: Descubrimiento y Análisis",
      "Fase 3: Propuesta y Viabilidad",
      "Fase 4: Negociación Económica",
      "Fase 5: Ajustes y Concesiones Tácticas",
      "Fase 6: Consolidación y Cierre",
      "Fase 7: Consolidación y Alianza",
    ];
    const phaseTexts = [
      [contextoBase, "Estableces el primer intercambio formal. Evalúan tu tono, postura y disposición inicial."],
      ["Profundizas en las verdaderas necesidades, urgencias y restricciones del escenario.", "Es el momento clave para escuchar antes de proponer soluciones definitivas."],
      ["Se evalúan los detalles técnicos, alcances y requerimientos específicos de la operación.", "Demostrar solidez aquí despeja las principales dudas operativas."],
      ["El foco se desplaza hacia los números, márgenes y condiciones financieras.", "Cada parte busca defender su rentabilidad sin romper el acuerdo."],
      ["Surgen contrapropuestas sobre la mesa tras evaluar las primeras cifras.", "Tus decisiones de aquí en adelante determinarán si mantienes el margen o cedes terreno."],
      ["Los puntos principales han sido debatidos; es hora de concretar los acuerdos finales y definir plazos.", "El pulso final de la negociación."],
      ["Afinando los últimos detalles de la colaboración para asegurar una relación duradera y exitosa."],
    ];
    const idx = Math.min(Math.max(rondaNum, 1), 7) - 1;
    return {
      title: phaseTitles[idx],
      text: phaseTexts[idx],
    };
  };

  const currentDetails = getRoundDetails(rondaActual, escenario.contexto);

  const scene = escenario.escenas.find((s) => s.id === sceneId) || {
    id: sceneId,
    chapter: `Ronda ${rondaActual || 1} de 7`,
    title: currentDetails.title,
    text: currentDetails.text,
    choices: fallbackChoices,
  } as unknown as Scene;

  const fullText = phase === "scene" ? scene?.text?.join("\n\n") ?? "" : "";
  const isTyping = phase === "scene" && typed < fullText.length;

  const cambiarEscenario = (id: string) => {
    setEscenarioId(id);
    const esc = escenarios.find((e) => e.id === id) ?? escenarios[0];
    setSceneId(esc.inicio);
    setStats(initStats(esc.stats));
    setLog([]);
    setFlags([]);
    setEventosDisparados(0);
    setCurrentEvent(null);
    setEventResultText(null);
    setFeedback(null);
    setEnding(null);
    setPhase("intro");
  };

  // Typewriter effect
  useEffect(() => {
    if (phase !== "scene") return;
    if (typer.current) clearInterval(typer.current);
    typer.current = setInterval(() => {
      setTyped((t) => {
        if (t >= fullText.length) {
          if (typer.current) clearInterval(typer.current);
          return t;
        }
        return t + 2;
      });
    }, 12);
    return () => {
      if (typer.current) clearInterval(typer.current);
    };
  }, [phase, sceneId, fullText]);

  useEffect(
    () => () => {
      if (typer.current) clearInterval(typer.current);
    },
    []
  );

  const checkSurpriseEvent = useCallback(
    (nextStats: Record<string, number>, currentFlags: string[], nextScene: string) => {
      if (!escenario.eventos || escenario.eventos.length === 0 || eventosDisparados >= 1) return false;
      const probBase = 0.25;
      if (Math.random() > probBase) return false;

      const disponibles = escenario.eventos.filter((ev) => {
        if (currentFlags.includes(`event-seen:${ev.id}`)) return false;
        if (ev.requiere) {
          return ev.requiere.every((c) => {
            const v = nextStats[c.stat] ?? 0;
            if (c.min !== undefined && v < c.min) return false;
            if (c.max !== undefined && v > c.max) return false;
            return true;
          });
        }
        return true;
      });

      if (disponibles.length === 0) return false;
      const ev = disponibles[Math.floor(Math.random() * disponibles.length)];
      setCurrentEvent(ev);
      setEventResultText(null);
      setPendingNextSceneId(nextScene);
      setFlags((f) => [...f, `event-seen:${ev.id}`]);
      setEventosDisparados((n) => n + 1);

      if (!ev.opciones || ev.opciones.length === 0) {
        const updated = { ...nextStats };
        if (ev.efectos) {
          for (const ef of ev.efectos) {
            const st = escenario.stats.find((s) => s.key === ef.stat);
            if (st) {
              updated[ef.stat] = Math.max(0, Math.min(st.max, (updated[ef.stat] ?? 0) + ef.delta));
            }
          }
          setStats(updated);
        }
      }
      setPhase("event");
      return true;
    },
    [escenario, eventosDisparados]
  );

  const gotoEnding = useCallback(
    (finalStats: Record<string, number>, currentLog: DecisionLogEntry[], currentFlags: string[], evCount: number) => {
      const fin = resolveEnding(escenario.finales, finalStats);
      setEnding(fin);
      setPhase("ending");

      const ctx = {
        rank: fin.rank,
        stats: finalStats,
        decisiones: currentLog.length,
        eventos: evCount,
        flags: currentFlags,
      };

      const desbloqueables = LOGROS.filter((l) => l.juego === game.slug && cumpleLogro(l, ctx));
      const idsNuevos = desbloqueables.map((l) => l.id);
      const registrados = registrarLogros(game.slug, idsNuevos);
      setNuevosLogros(registrados);

      const metricaPrincipal = finalStats[escenario.stats[0]?.key] ?? 0;
      registrarPartida(game.slug, fin.rank, metricaPrincipal, registrados.length);

      clearProgress(game.slug, escenarioId);
    },
    [escenario, game.slug, escenarioId]
  );

  const choose = useCallback(
    (idx: number) => {
      const choice = scene.choices[idx];
      if (!choice) return;

      const next = { ...stats };
      const deltas = choice.effects.map((e) => {
        const st = escenario.stats.find((s) => s.key === e.stat)!;
        const before = next[e.stat];
        next[e.stat] = Math.max(0, Math.min(st.max, before + e.delta));
        return {
          icon: st.icon,
          label: st.label,
          delta: next[e.stat] - before,
          pct: st.max ? ((next[e.stat] - before) / st.max) * 100 : 0,
          money: st.format === "money",
        };
      });

      const updatedFlags = choice.flag ? [...flags, choice.flag] : flags;
      setFlags(updatedFlags);

      const nextLog = [...log, { label: choice.label, result: choice.result, n: log.length + 1 }];
      setStats(next);
      setShake((x) => x + 1);
      setLog(nextLog);

      setFeedback({
        choiceIdx: idx,
        deltas,
        result: choice.result,
        nextSceneId: choice.next,
        isEnd: choice.next === "END",
      });
      setPhase("feedback");
    },
    [rondaActual, stats, escenario.stats, flags, log]
  );

  const avanzarDesdeFeedback = useCallback(() => {
    if (!feedback) return;
    if (feedback.isEnd) {
      gotoEnding(stats, log, flags, eventosDisparados);
    } else {
      if (escenario.escenas && escenario.escenas.length > 0) {
        const nextSId = feedback.nextSceneId;
        const huboEvento = checkSurpriseEvent(stats, flags, nextSId);
        if (!huboEvento) {
          setTyped(0);
          setSceneId(nextSId);
          setFeedback(null);
          setPhase("scene");
          saveProgress({
            slug: game.slug,
            scope: escenarioId,
            phase: "scene",
            sceneId: nextSId,
            stats,
            log,
            savedAt: Date.now(),
          });
        }
      } else {
        // Modo dinámico síncrono: calcular la siguiente ronda directamente usando la baraja barajada
        const siguienteRonda = rondaActual + 1;
        if (siguienteRonda > 7) {
          gotoEnding(stats, log, flags, eventosDisparados);
        } else {
          setRondaActual(siguienteRonda);
          const nuevoTipo = poolBarajado[siguienteRonda - 1] || "apertura";
          setSceneId(nuevoTipo);
          setTyped(0);
          setFeedback(null);
          setPhase("scene");
          saveProgress({
            slug: game.slug,
            scope: escenarioId,
            phase: "scene",
            sceneId: nuevoTipo,
            stats,
            log,
            savedAt: Date.now(),
          });
        }
      }
    }
  }, [feedback, stats, log, flags, eventosDisparados, checkSurpriseEvent, game.slug, escenarioId, escenario, rondaActual]);
  const manejarOpcionEvento = (efectos: { stat: string; delta: number }[], resultado: string) => {
    const next = { ...stats };
    for (const ef of efectos) {
      const st = escenario.stats.find((s) => s.key === ef.stat);
      if (st) {
        next[ef.stat] = Math.max(0, Math.min(st.max, (next[ef.stat] ?? 0) + ef.delta));
      }
    }
    setStats(next);
    setEventResultText(resultado);
  };

  const cerrarEvento = () => {
    setCurrentEvent(null);
    setEventResultText(null);
    setTyped(0);
    setSceneId(pendingNextSceneId);
    setPhase("scene");
    saveProgress({
      slug: game.slug,
      scope: escenarioId,
      phase: "scene",
      sceneId: pendingNextSceneId,
      stats,
      log,
      savedAt: Date.now(),
    });
  };

  const skipToEndOfText = useCallback(() => {
    if (phase === "scene" && typed < fullText.length) setTyped(fullText.length);
  }, [phase, typed, fullText.length]);

  const start = useCallback(() => {
    clearProgress(game.slug, escenarioId);
    setStats(initStats(escenario.stats));
    setLog([]);
    setFlags([]);
    setEventosDisparados(0);
    setCurrentEvent(null);
    setEventResultText(null);
    setSceneId(escenario.inicio);
    setEnding(null);
    setFeedback(null);
    setTyped(0);
    setPhase("scene");
    // Regenerar baraja al reiniciar
    const pool = escenario.poolRondasDisponibles ?? [
      "apertura", "investigacion", "tecnica", "precio", "contraoferta", "cierre", "alianza", "riesgo", "validacion", "sorpresa"
    ];
    const disponibles = pool.filter(t => pool.includes(t));
    const fijos = { 1: "apertura", 6: "cierre", 7: "alianza" };
    const medio = disponibles.filter(t => !Object.values(fijos).includes(t));
    for (let i = medio.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [medio[i], medio[j]] = [medio[j], medio[i]];
    }
    const nuevoPool: string[] = [];
    nuevoPool[0] = fijos[1];
    nuevoPool[1] = medio[0];
    nuevoPool[2] = medio[1];
    nuevoPool[3] = medio[2];
    nuevoPool[4] = medio[3];
    nuevoPool[5] = fijos[6];
    nuevoPool[6] = fijos[7];
    setPoolBarajado(nuevoPool);
    setRondaActual(1);
  }, [game.slug, escenarioId, escenario]);

  const continueSaved = useCallback(() => {
    if (!saved) return;
    setStats(saved.stats);
    setLog(saved.log);
    setSceneId(saved.sceneId);
    setTyped(0);
    setFeedback(null);
    if (saved.phase === "ending") {
      setEnding(resolveEnding(escenario.finales, saved.stats));
      setPhase("ending");
    } else {
      setEnding(null);
      setPhase("scene");
    }
  }, [saved, escenario.finales]);

  const restart = useCallback(() => {
    clearProgress(game.slug, escenarioId);
    setStats(initStats(escenario.stats));
    setLog([]);
    setSceneId(escenario.inicio);
    setEnding(null);
    setFeedback(null);
    setTyped(0);
    setPhase("scene");
  }, [game.slug, escenarioId, escenario]);

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
        if ((tag === "BUTTON" || tag === "A" || tag === "SUMMARY") && (e.key === " " || e.key === "Enter")) {
          return;
        }
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (phase === "scene") {
        if (isTyping) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            skipToEndOfText();
          }
          return;
        }
        const n = Number(e.key);
        if (Number.isInteger(n) && n >= 1 && n <= scene.choices.length) {
          e.preventDefault();
          choose(n - 1);
        }
        return;
      }

      if (phase === "feedback" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        avanzarDesdeFeedback();
        return;
      }

      if (phase === "intro" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        if (saved) continueSaved();
        else start();
        return;
      }

      if (phase === "ending" && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        restart();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, isTyping, scene?.choices?.length, choose, skipToEndOfText, saved, continueSaved, start, restart, avanzarDesdeFeedback]);

  const visibleText = fullText.slice(0, typed);

  // Calcular progreso de ronda para la UI
  const rondaProgreso = escenario.escenas && escenario.escenas.length > 0 
    ? null 
    : Math.min(rondaActual, 7);
  const totalRondas = 7;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24 pt-28 md:pt-32">
      {/* Terminal shell */}
      <div className="rounded-2xl border border-white/10 bg-[#0E0F1A] shadow-[0_30px_80px_-20px_rgba(217,70,239,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/10 bg-[#13141E]">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] shrink-0" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E] shrink-0" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] shrink-0" />
          <span className="ml-1 sm:ml-3 min-w-0 flex-1 truncate font-mono text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">
            {game.icon} {game.slug} [{escenario.etiqueta}] — bylesther.dev/games
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            EN LÍNEA
          </span>
        </div>

        {/* Round Progress Indicator */}
        {rondaProgreso && (
          <div className="px-4 sm:px-5 py-3 border-b border-white/10 bg-[#0B0C15]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Ronda</span>
                <span className="font-mono text-lg font-bold text-white">{rondaProgreso} / {totalRondas}</span>
              </div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C026D3] to-[#D946EF] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(rondaProgreso / totalRondas) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider shrink-0">
                {rondaProgreso === totalRondas ? "FINAL" : `Ronda ${rondaProgreso}`}
              </span>
            </div>
          </div>
        )}

        {/* Stats bar */}
        {(phase === "scene" || phase === "feedback" || phase === "event") && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-5 py-4 border-b border-white/10 bg-[#0B0C15]">
            {escenario.stats.map((st) => {
              const val = stats[st.key] ?? 0;
              const pct = Math.min(100, (val / st.max) * 100);
              const isLow = pct < 30;
              const isHigh = pct > 70;
              return (
                <div key={st.key} className="min-w-0 group">
                  <div className="flex items-baseline justify-between gap-1 text-[10px] sm:text-[11px] font-mono text-white/50 mb-1.5">
                    <span className="truncate group-hover:text-white transition-colors" title={st.label}>
                      <span className="mr-1">{st.icon}</span>{st.label}
                    </span>
                    <span className={`shrink-0 font-mono ${isLow ? 'text-red-400' : isHigh ? 'text-emerald-400' : 'text-white/80'}`}>
                      {formatValue(st, val)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isLow ? 'bg-gradient-to-r from-red-500 to-red-400' :
                        isHigh ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                        'bg-gradient-to-r from-[#C026D3] to-[#D946EF]'
                      }`}
                      style={{
                        width: `${pct}%`,
                        boxShadow: pct > 0 ? "0 0 8px rgba(217,70,239,.5)" : "none",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="px-4 sm:px-6 py-7 sm:py-8 md:px-10 md:py-10 min-h-[380px]">
          {/* INTRO */}
          {phase === "intro" && (
            <div className="text-center py-10 animate-[fadeUp_.6s_ease-out]">
              {game.imagen && (
                <div className="mb-6 rounded-xl overflow-hidden border border-white/10 max-h-48 shadow-lg">
                  <img src={game.imagen} alt={game.title} className="w-full h-full object-cover opacity-90" />
                </div>
              )}
              <div className="text-6xl mb-6">{game.icon}</div>
              <h1 className="font-serif text-4xl md:text-5xl text-white mb-3">{game.title}</h1>
              <p className="text-[var(--color-text-accent)] font-mono text-sm mb-6 tracking-wide">{game.tagline}</p>
              
              {escenarios.length > 1 && (
                <div className="mb-8 max-w-md mx-auto">
                  <p className="text-xs font-mono text-white/40 mb-3 uppercase tracking-wider">Selecciona el escenario:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {escenarios.map((esc) => {
                      const hasSave = !!savedProgresses[esc.id];
                      return (
                        <button
                          key={esc.id}
                          onClick={() => cambiarEscenario(esc.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            esc.id === escenarioId
                              ? "bg-[rgba(217,70,239,0.15)] border-[#D946EF] text-white"
                              : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/30"
                          }`}
                        >
                          <div className="font-serif text-base text-white mb-1">{esc.titulo}</div>
                          <div className="text-xs text-white/50 line-clamp-2">{esc.etiqueta}</div>
                          {hasSave && (
                            <span className="inline-block mt-2 font-mono text-[10px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                              ● Partida guardada
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto mb-8">
                {escenario.contexto}
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                {saved && saved.sceneId ? (
                  <>
                    <button onClick={continueSaved} className="btn-primary text-base px-8 py-3.5">
                      ▶ Continuar partida guardada
                    </button>
                    <button onClick={start} className="btn-tertiary text-base px-8 py-3.5">
                      Empezar de cero
                    </button>
                  </>
                ) : (
                  <button onClick={start} className="btn-primary text-base px-10 py-4">
                    ▶ Iniciar simulación ({escenario.etiqueta})
                  </button>
                )}
              </div>

              {saved && (
                <p className="mt-5 font-mono text-[11px] text-white/30">
                  Guardado el {new Date(saved.savedAt).toLocaleString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · {saved.log.length} decisiones
                </p>
              )}

              <p className="mt-6 font-mono text-[11px] text-white/30">
                DIFICULTAD {"◆".repeat(game.difficulty)}{"◇".repeat(3 - game.difficulty)} · ~{game.minutes} MIN
              </p>
            </div>
          )}

          {/* SCENE */}
          {phase === "scene" && scene && (
            <div onClick={skipToEndOfText} className="cursor-pointer">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] tracking-widest text-[var(--color-accent-kinetic)] uppercase">
                  {scene.chapter}
                </span>
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[10px] text-white/30">{escenario.etiqueta}</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">{scene.title}</h2>

              <p className="sr-only">{fullText}</p>
              <p aria-hidden="true" className="text-lg leading-relaxed text-white/85 whitespace-pre-line min-h-[120px] font-mono">
                {visibleText}
                {isTyping && <span className="caret" />}
              </p>

              {isTyping && (
                <p className="mt-4 font-mono text-[11px] text-white/30 animate-pulse">
                  pulsa Enter o haz clic para saltar la escritura…
                </p>
              )}

              {!isTyping && scene.choices && scene.choices.length > 0 && (
                <div className="mt-8 space-y-3 animate-[fadeUp_.4s_ease-out]">
                  {scene.choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        choose(i);
                      }}
                      aria-keyshortcuts={String(i + 1)}
                      className="choice group w-full text-left bg-gradient-to-r from-white/[0.02] to-white/[0.01] border border-white/10 hover:border-[var(--color-accent-kinetic)]/50 hover:bg-gradient-to-r hover:from-white/[0.03] hover:to-white/[0.02] rounded-xl p-4 transition-all duration-200 ease-out hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] hover:border-[var(--color-accent-kinetic)]/30"
                    >
                      <div className="flex items-start gap-4">
                        <span className="choice-idx font-mono text-[11px] text-white/40 shrink-0 w-10 text-right">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="block text-white group-hover:text-white transition-colors text-base leading-relaxed">{c.label}</span>
                          {c.hint && (
                            <span className="block text-xs text-white/40 mt-1.5 font-mono flex items-center gap-1">
                              <span className="text-[var(--color-accent-kinetic)]">↳</span>
                              <span>{c.hint}</span>
                            </span>
                          )}
                        </div>
                        <span className="choice-arrow text-[var(--color-accent-kinetic)] group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </div>
                    </button>
                  ))}
                  <p className="pt-3 font-mono text-[10px] text-white/20 flex items-center gap-1">
                    <span className="kbd">1</span>
                    <span className="kbd">2</span>
                    <span className="kbd">3</span>
                    <span className="text-white/30">para elegir</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EVENTO SORPRESA */}
          {phase === "event" && currentEvent && (
            <div className="animate-[fadeUp_.4s_ease-out]">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] tracking-widest text-amber-400 uppercase">
                  ⚡ EVENTO INESPERADO · {currentEvent.icono}
                </span>
                <span className="h-px flex-1 bg-amber-400/20" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">{currentEvent.titulo}</h2>
              <p className="text-lg leading-relaxed text-white/85 font-mono mb-8 whitespace-pre-line">
                {currentEvent.texto}
              </p>

              {eventResultText ? (
                <div className="animate-[fadeUp_.3s_ease-out]">
                  <p className="font-serif text-xl text-white mb-6 border-l-2 border-amber-400 pl-4 py-1">
                    {eventResultText}
                  </p>
                  <button onClick={cerrarEvento} className="btn-primary group">
                    Continuar simulación <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              ) : currentEvent.opciones && currentEvent.opciones.length > 0 ? (
                <div className="space-y-3">
                  {currentEvent.opciones.map((op, i) => (
                    <button
                      key={i}
                      onClick={() => manejarOpcionEvento(op.effects, op.resultado)}
                      className="choice group w-full text-left bg-gradient-to-r from-amber-500/5 to-amber-500/2 border border-amber-400/30 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-500/5 rounded-xl p-4 transition-all duration-200 ease-out hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:border-amber-400/50"
                    >
                      <div className="flex items-start gap-4">
                        <span className="choice-idx font-mono text-[11px] text-amber-400 shrink-0 w-10 text-right">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="block text-white group-hover:text-white transition-colors text-base leading-relaxed">{op.label}</span>
                          {op.hint && (
                            <span className="block text-xs text-white/40 mt-1.5 font-mono flex items-center gap-1">
                              <span className="text-amber-400">↳</span>
                              <span>{op.hint}</span>
                            </span>
                          )}
                        </div>
                        <span className="choice-arrow text-amber-400 group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <button onClick={cerrarEvento} className="btn-primary group">
                  Entendido, seguir <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              )}
            </div>
          )}

          {/* FEEDBACK */}
          {phase === "feedback" && feedback && (
            <div className="animate-[fadeUp_.3s_ease-out]" key={shake}>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] tracking-widest text-[var(--color-accent-kinetic)] uppercase">
                  {" > "}Decisión {String(feedback.choiceIdx + 1).padStart(2, "0")} registrada
                </span>
                <span className="h-px flex-1 bg-white/10" />
                {rondaProgreso && (
                  <span className="font-mono text-[10px] text-white/30 shrink-0">
                    Ronda {rondaProgreso} / {totalRondas}
                  </span>
                )}
              </div>
              <div role="status" aria-live="polite">
                <p className="font-serif text-2xl md:text-3xl text-white leading-snug mb-8 border-l-2 border-[var(--color-accent-kinetic)] pl-5">
                  {feedback.result}
                </p>
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {feedback.deltas.map((d, i) => (
                    <span key={i} className={`delta-chip ${d.delta >= 0 ? "delta-up" : "delta-down"} flex items-center gap-1.5`}>
                      <span className="text-lg">{d.icon}</span>
                      <span className="font-medium">{d.label}</span>
                      <span className={`font-bold ${d.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {d.delta >= 0 ? "+" : "−"}{d.money ? `$${Math.abs(d.delta).toLocaleString("es-CL")}` : Math.abs(d.delta)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <button onClick={avanzarDesdeFeedback} className="btn-primary text-base px-8 py-3.5 group">
                  <span className="flex items-center gap-2">Siguiente escena</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <span className="font-mono text-xs text-white/40 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">Enter</kbd>
                  <span className="text-white/30">o</span>
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">Espacio</kbd>
                </span>
              </div>
            </div>
          )}

          {/* ENDING */}
          {phase === "ending" && ending && (
            <div className="text-center py-6 animate-[fadeUp_.6s_ease-out]">
              {/* Tarjeta ocultamente renderizada para captura de imagen */}
              <div className="absolute -left-[9999px] top-0 pointer-events-none">
                <div
                  ref={shareCardRef}
                  style={{ width: "600px", background: "#0E0F1A", color: "#FFFFFF", padding: "40px", fontFamily: "Inter, sans-serif", border: "1px solid rgba(217,70,239,0.3)", borderRadius: "24px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "750", letterSpacing: "-0.02em" }}>
                      ByLesther<span style={{ color: "#D946EF" }}>Games</span>
                    </span>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#C084FC", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {game.title} · {escenario.etiqueta}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
                    <div style={{ width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "42px", fontWeight: "bold", background: "linear-gradient(135deg, #6B21A8 0%, #D946EF 100%)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {ending.rank}
                    </div>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>
                        Resultado de Simulación
                      </div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "26px", marginBottom: "8px" }}>
                        {ending.title}
                      </div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: "1.4" }}>
                        {ending.text.slice(0, 110)}...
                      </div>
                    </div>
                  </div>

                  {nuevosLogros.length > 0 && (
                    <div style={{ marginBottom: "24px", padding: "14px 18px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "14px" }}>
                      <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "10px" }}>
                        🏆 Logros desbloqueados
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {nuevosLogros.map((nl) => {
                          const item = LOGROS.find((l) => l.id === nl.id);
                          if (!item) return null;
                          return (
                            <span key={nl.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px", fontSize: "12px" }}>
                              <span>{item.icono}</span> {item.nombre}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "20px", padding: "16px 18px", background: "linear-gradient(135deg, rgba(217,70,239,0.12) 0%, rgba(107,33,168,0.12) 100%)", border: "1px dashed rgba(217,70,239,0.4)", borderRadius: "14px", marginBottom: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>
                      🎮 ¿Puedes conseguir un rank mejor que {ending.rank}?
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#D946EF", letterSpacing: "0.05em" }}>
                      Juega gratis en games.bylesther.dev/games/{game.slug}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    <span>Decisiones tomadas: {log.length}</span>
                    <span style={{ color: "#D946EF" }}>games.bylesther.dev</span>
                  </div>
                </div>
              </div>

              <div className="rank-badge mb-6" style={{ boxShadow: `0 0 80px ${game.accent}88`, animation: "pulse 2s ease-in-out infinite" }}>
                {ending.rank}
              </div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/40 mb-2">
                {ending.rank === "S"
                  ? "Final perfecto"
                  : ending.rank === "A"
                    ? "Gran final"
                    : ending.rank === "B"
                      ? "Final aceptable"
                      : "Final destructivo"}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">{ending.title}</h2>
              <p className="text-white/80 leading-relaxed max-w-xl mx-auto mb-8">{ending.text}</p>

              {nuevosLogros.length > 0 && (
                <div className="max-w-md mx-auto mb-8 p-4 rounded-xl border border-amber-400/30 bg-amber-400/10 text-left animate-[fadeUp_.5s_ease-out]">
                  <p className="font-mono text-xs tracking-wider text-amber-400 uppercase mb-2">
                    🏆 ¡Logros desbloqueados!
                  </p>
                  <div className="space-y-2">
                    {nuevosLogros.map((nl) => {
                      const item = LOGROS.find((l) => l.id === nl.id);
                      if (!item) return null;
                      return (
                        <div key={nl.id} className="flex items-center gap-3 text-sm">
                          <span className="text-2xl">{item.icono}</span>
                          <div>
                            <span className="font-bold text-white block">{item.nombre}</span>
                            <span className="text-xs text-white/60">{item.descripcion}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {log.length > 0 && (
                <details className="text-left max-w-xl mx-auto mb-8 rounded-xl border border-white/10 bg-white/[0.02]">
                  <summary className="cursor-pointer px-5 py-3.5 font-mono text-xs text-white/50 hover:text-white transition-colors select-none">
                    📜 Ver historial de decisiones ({log.length})
                  </summary>
                  <div className="px-5 pb-5 space-y-3 max-h-64 overflow-y-auto">
                    {log.map((l, i) => (
                      <div key={i} className="text-sm border-l-2 border-white/10 pl-3">
                        <p className="text-white/70">
                          {l.n}. {l.label}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5 font-mono">{l.result}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div className="mb-8 max-w-md mx-auto p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="font-mono text-xs text-white/50 mb-3 uppercase tracking-wider">Compartir tu resultado:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={async () => {
                      if (!shareCardRef.current) return;
                      const url = `${window.location.origin}/games/${game.slug}`;
                      const texto = `🎮 ¡Terminé "${game.title}" con rango ${ending.rank} — "${ending.title}"! ¿Te atreves a superarme? Juega gratis: ${url}`;
                      const res = await compartirTarjetaConTexto(shareCardRef.current, texto, `${game.slug}-resultado-rank-${ending.rank}.png`);
                      if (res === "compartido") {
                        setCompartidoMsg("¡Imagen y texto compartidos!");
                      } else if (res === "cancelado") {
                        setCompartidoMsg(null);
                        return;
                      } else {
                        // El navegador no puede adjuntar archivos: solo texto por WhatsApp.
                        window.open(linkWhatsApp(texto), "_blank", "noopener");
                        setCompartidoMsg("Tu navegador no permite adjuntar la imagen; se abrió WhatsApp con el texto.");
                      }
                      setTimeout(() => setCompartidoMsg(null), 3500);
                    }}
                    className="btn-whatsapp text-xs py-2 px-4"
                  >
                    💬 Compartir en WhatsApp
                  </button>
                  <button
                    onClick={async () => {
                      if (!shareCardRef.current) return;
                      const url = `${window.location.origin}/games/${game.slug}`;
                      const texto = `🎮 ¡Terminé "${game.title}" con rango ${ending.rank} — "${ending.title}"! ¿Te atreves a superarme? Juega gratis: ${url}`;
                      const res = await compartirTarjetaConTexto(shareCardRef.current, texto, `${game.slug}-resultado-rank-${ending.rank}.png`);
                      if (res === "compartido") {
                        setCompartidoMsg("¡Imagen y texto compartidos!");
                      } else if (res === "cancelado") {
                        setCompartidoMsg(null);
                        return;
                      } else {
                        // Fallback: solo texto vía intent de X.
                        window.open(linkX(texto), "_blank", "noopener");
                        setCompartidoMsg("Tu navegador no permite adjuntar la imagen; se abrió X con el texto.");
                      }
                      setTimeout(() => setCompartidoMsg(null), 3500);
                    }}
                    className="btn-tertiary text-xs py-2 px-4"
                  >
                    𝕏 Compartir en X
                  </button>
                  <button
                    onClick={async () => {
                      const url = `${window.location.origin}/games/${game.slug}`;
                      const res = await compartir({
                        titulo: `${game.title} — Rank ${ending.rank}`,
                        texto: `🎮 ¡Terminé "${game.title}" con rango ${ending.rank} — "${ending.title}"! ¿Te atreves a superarme? Juega gratis: ${url}`,
                      });
                      setCompartidoMsg(res.modo === "copiado" ? "¡Texto copiado al portapapeles!" : res.modo === "nativo" ? "¡Compartido con éxito!" : "No se pudo compartir");
                      setTimeout(() => setCompartidoMsg(null), 3000);
                    }}
                    className="btn-tertiary text-xs py-2 px-4"
                  >
                    📋 Copiar texto
                  </button>
                </div>
                {compartidoMsg && (
                  <p className="mt-2 font-mono text-xs text-emerald-400 animate-pulse">{compartidoMsg}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={restart} className="btn-primary group">
                  ↺ Jugar de nuevo <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <Link href="/" className="btn-tertiary group">
                  ← Volver a la colección <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
              <p className="mt-5 font-mono text-[11px] text-white/25">
                atajo: <span className="kbd">R</span> para reiniciar
              </p>
            </div>
          )}
        </div>

        {/* Footer terminal */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-white/10 bg-[#13141E] flex items-center justify-between gap-3 font-mono text-[10px] text-white/30">
          <span className="truncate">Simulación interactiva — sin consecuencias reales</span>
          <span className="shrink-0">{game.category.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
