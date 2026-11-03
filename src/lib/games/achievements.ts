"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { toBlob } from "html-to-image";

export type Rank = "S" | "A" | "B" | "C" | "D";

const ORDEN_RANK: Rank[] = ["S", "A", "B", "C", "D"];

export interface CondicionesLogro {
  rank?: Rank;
  statMin?: Record<string, number>;
  statMax?: Record<string, number>;
  decisionesMin?: number;
  decisionesMax?: number;
  eventosMin?: number;
  eventosMax?: number;
  /** El jugador debe haber activado todas estas marcas. */
  flags?: string[];
}

export interface Logro {
  id: string;
  juego: string;
  nombre: string;
  descripcion: string;
  icono: string;
  condiciones?: CondicionesLogro;
}

export interface ContextoEvaluacion {
  rank: Rank;
  stats: Record<string, number>;
  decisiones: number;
  eventos: number;
  flags: string[];
}

export function cumpleLogro(logro: Logro, ctx: ContextoEvaluacion): boolean {
  const c = logro.condiciones;
  if (!c) return false;

  if (c.rank && c.rank !== ctx.rank) return false;

  if (c.statMin) {
    for (const [stat, min] of Object.entries(c.statMin)) {
      if ((ctx.stats[stat] ?? 0) < min) return false;
    }
  }
  if (c.statMax) {
    for (const [stat, max] of Object.entries(c.statMax)) {
      if ((ctx.stats[stat] ?? 0) > max) return false;
    }
  }
  if (c.decisionesMin !== undefined && ctx.decisiones < c.decisionesMin) return false;
  if (c.decisionesMax !== undefined && ctx.decisiones > c.decisionesMax) return false;
  if (c.eventosMin !== undefined && ctx.eventos < c.eventosMin) return false;
  if (c.eventosMax !== undefined && ctx.eventos > c.eventosMax) return false;
  if (c.flags && !c.flags.every((f) => ctx.flags.includes(f))) return false;

  return true;
}

/* ------------------------------------------------------------------ */
/*  CATÁLOGO DE LOGROS                                                  */
/* ------------------------------------------------------------------ */

export const LOGROS: Logro[] = [
  // --- Atención al Cliente ---
  {
    id: "ac-s-rank",
    juego: "atencion-cliente",
    nombre: "Final perfecto",
    descripcion: "Termina un escenario con ranking S.",
    icono: "🏆",
    condiciones: { rank: "S" },
  },
  {
    id: "ac-imparable",
    juego: "atencion-cliente",
    nombre: "Imparable",
    descripcion: "Termina un escenario sin que te ocurra ningún imprevisto.",
    icono: "🛡️",
    condiciones: { eventosMax: 0 },
  },
  {
    id: "ac-queja-mayor",
    juego: "atencion-cliente",
    nombre: "Dolor de cabeza",
    descripcion: "Termina un escenario con al menos 3 eventos sorpresa.",
    icono: "🌀",
    condiciones: { eventosMin: 3 },
  },
  {
    id: "ac-propietario",
    juego: "atencion-cliente",
    nombre: "Dueño del problema",
    descripcion: "Cierras con satisfacción y paciencia en 80 o más.",
    icono: "🧭",
    condiciones: { statMin: { sat: 80, pac: 80 } },
  },
  {
    id: "ac-cirugia",
    juego: "atencion-cliente",
    nombre: "Cirugía mayor",
    descripcion: "Recuperas una cuenta que había caído a cero de satisfacción.",
    icono: "🩺",
    condiciones: { statMin: { sat: 55 }, statMax: { sat: 75 } },
  },
  {
    id: "ac-rapido",
    juego: "atencion-cliente",
    nombre: "Respuesta Rápida",
    descripcion: "Resuelves un escenario en 3 decisiones o menos.",
    icono: "⚡",
    condiciones: { decisionesMax: 3 },
  },
  {
    id: "ac-paciente-extrema",
    juego: "atencion-cliente",
    nombre: "Paciente Eterna",
    descripcion: "Termina un escenario con paciencia en 90 o más.",
    icono: "🧘",
    condiciones: { statMin: { pac: 90 } },
  },
  {
    id: "ac-queja-vip",
    juego: "atencion-cliente",
    nombre: "Queja VIP",
    descripcion: "Termina un escenario con satisfacción en 90 o más.",
    icono: "👑",
    condiciones: { statMin: { sat: 90 } },
  },

  // --- Negociación ---
  {
    id: "neg-rapido",
    juego: "negociacion",
    nombre: "Negociación Rápida",
    descripcion: "Cierras un escenario en 5 decisiones o menos.",
    icono: "⏱️",
    condiciones: { decisionesMax: 5 },
  },
  {
    id: "neg-alto-margen",
    juego: "negociacion",
    nombre: "Alto Margen",
    descripcion: "Cierras conservando 85 de margen o más.",
    icono: "💰",
    condiciones: { statMin: { mar: 85 } },
  },
  {
    id: "neg-rel-pura",
    juego: "negociacion",
    nombre: "Relación Pura",
    descripcion: "Terminas con relación en 90 o más sin importar el margen.",
    icono: "💝",
    condiciones: { statMin: { rel: 90 } },
  },
  {
    id: "neg-s-rank",
    juego: "negociacion",
    nombre: "Termino medio alto",
    descripcion: "Terminas un escenario con ranking S.",
    icono: "🏆",
    condiciones: { rank: "S" },
  },
  {
    id: "neg-margen",
    juego: "negociacion",
    nombre: "Sin concesiones",
    descripcion: "Cierras conservando 70 de margen o más.",
    icono: "📈",
    condiciones: { statMin: { mar: 70 } },
  },
  {
    id: "neg-palanca",
    juego: "negociacion",
    nombre: "Palanca viva",
    descripcion: "Cierras con 70 de palanca o más.",
    icono: "⚔️",
    condiciones: { statMin: { pal: 70 } },
  },
  {
    id: "neg-veloz",
    juego: "negociacion",
    nombre: "Sin rodeos",
    descripcion: "Resuelves un escenario en 4 decisiones o menos.",
    icono: "⚡",
    condiciones: { decisionesMax: 4 },
  },
  {
    id: "neg-imparable",
    juego: "negociacion",
    nombre: "Sin interrupciones",
    descripcion: "Terminas un escenario sin eventos sorpresa.",
    icono: "🛡️",
    condiciones: { eventosMax: 0 },
  },
  {
    id: "neg-paciencia",
    juego: "negociacion",
    nombre: "Roca",
    descripcion: "Terminas con relación en 80 o más.",
    icono: "🪨",
    condiciones: { statMin: { rel: 80 } },
  },

  // --- Cazador de Leads ---
  {
    id: "lead-s-rank",
    juego: "cazador-leads",
    nombre: "Pipeline de oro",
    descripcion: "Terminas un escenario con ranking S.",
    icono: "🏆",
    condiciones: { rank: "S" },
  },
  {
    id: "lead-meta",
    juego: "cazador-leads",
    nombre: "Meta superada",
    descripcion: "Superas la meta de pipeline de un escenario.",
    icono: "🎯",
    condiciones: { statMin: { pipeline: 180000 } },
  },
  {
    id: "lead-sin-descarte",
    juego: "cazador-leads",
    nombre: "Ningún descarte",
    descripcion: "Terminas un escenario sin descartar ningún lead.",
    icono: "🧲",
    condiciones: { flags: ["sin-descartes"] },
  },
  {
    id: "lead-calificador",
    juego: "cazador-leads",
    nombre: "Calificador",
    descripcion: "Calificas 6 leads o más en un escenario.",
    icono: "🔎",
    condiciones: { statMin: { calificados: 6 } },
  },
  {
    id: "lead-efectivo",
    juego: "cazador-leads",
    nombre: "Alta eficiencia",
    descripcion: "Terminas un escenario usando 8 slots o menos.",
    icono: "🪶",
    condiciones: { statMax: { slotsUsados: 8 } },
  },
  {
    id: "lead-top-cliente",
    juego: "cazador-leads",
    nombre: "Cliente Top",
    descripcion: "Calificas 10 leads o más en un escenario.",
    icono: "🌟",
    condiciones: { statMin: { calificados: 10 } },
  },
  {
    id: "lead-magnate",
    juego: "cazador-leads",
    nombre: "Magnate del pipeline",
    descripcion: "Cierras un escenario con pipeline de $250.000 o más.",
    icono: "💎",
    condiciones: { statMin: { pipeline: 250000 } },
  },
];

/* ------------------------------------------------------------------ */
/*  PERSISTENCIA LOCAL                                                  */
/* ------------------------------------------------------------------ */

const LOGROS_KEY = "games:logros";
const RECORDS_KEY = "games:records";
const HISTORIAL_KEY = "games:historial";
const CHANGE_EVENT = "games:progress-change";

export interface LogroRegistrado {
  id: string;
  juego: string;
  fecha: number;
}

export interface RecordJuego {
  slug: string;
  mejorRank: Rank;
  partidas: number;
  mejorMetrica: number;
  actualizado: number;
}

/** Una partida terminada, con fecha y resultado. Se guardan las últimas 50. */
export interface PartidaHistorial {
  slug: string;
  rank: Rank;
  metrica: number;
  fecha: number;
  logrosNuevos: number;
}

/** Estadísticas agregadas del jugador, calculadas desde el almacenamiento local. */
export interface EstadisticasJugador {
  totalPartidas: number;
  distribucionRanks: Record<Rank, number>;
  logrosDesbloqueados: number;
  logrosTotales: number;
  partidasUltimos7Dias: number;
  ultimaPartida: number | null;
  juegoFavorito: string | null;
}

function leer<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function guardar(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Sin persistencia
  }
}

function useAlmacen<T>(key: string, fallback: T): T {
  const subscribe = useCallback((onChange: () => void) => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) onChange();
    };
    const onLocal = () => onChange();
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGE_EVENT, onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CHANGE_EVENT, onLocal);
    };
  }, [key]);

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);
  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => (raw ? leer<T>(key, fallback) : fallback), [raw, key, fallback]);
}

export function useLogrosDesbloqueados(): LogroRegistrado[] {
  const fallback = useMemo<LogroRegistrado[]>(() => [], []);
  return useAlmacen<LogroRegistrado[]>(LOGROS_KEY, fallback);
}

export function useRecords(): RecordJuego[] {
  const fallback = useMemo<RecordJuego[]>(() => [], []);
  return useAlmacen<RecordJuego[]>(RECORDS_KEY, fallback);
}

export function registrarLogros(juego: string, ids: string[]): LogroRegistrado[] {
  const actuales = leer<LogroRegistrado[]>(LOGROS_KEY, []);
  const yaTenidos = new Set(actuales.map((l) => l.id));
  const nuevos: LogroRegistrado[] = [];
  for (const id of ids) {
    if (yaTenidos.has(id)) continue;
    yaTenidos.add(id);
    nuevos.push({ id, juego, fecha: Date.now() });
  }
  if (nuevos.length > 0) guardar(LOGROS_KEY, [...actuales, ...nuevos]);
  return nuevos;
}

export function registrarPartida(
  slug: string,
  rank: Rank,
  metrica: number,
  logrosNuevos = 0
): RecordJuego[] {
  const actuales = leer<RecordJuego[]>(RECORDS_KEY, []);
  const previo = actuales.find((r) => r.slug === slug);
  const mejorRank: Rank = previo
    ? ORDEN_RANK.indexOf(rank) < ORDEN_RANK.indexOf(previo.mejorRank)
      ? rank
      : previo.mejorRank
    : rank;
  const registro: RecordJuego = {
    slug,
    mejorRank,
    partidas: (previo?.partidas ?? 0) + 1,
    mejorMetrica: Math.max(previo?.mejorMetrica ?? 0, metrica),
    actualizado: Date.now(),
  };
  const nuevos = [...actuales.filter((r) => r.slug !== slug), registro];

  // Historial de las últimas 50 partidas.
  const historial = leer<PartidaHistorial[]>(HISTORIAL_KEY, []);
  historial.push({ slug, rank, metrica, fecha: Date.now(), logrosNuevos });
  const historialRecortado = historial.slice(-50);

  guardar(RECORDS_KEY, nuevos);
  guardar(HISTORIAL_KEY, historialRecortado);
  return nuevos;
}

/** Últimas partidas jugadas (máximo 50, la más reciente al final). */
export function useHistorial(): PartidaHistorial[] {
  const fallback = useMemo<PartidaHistorial[]>(() => [], []);
  return useAlmacen<PartidaHistorial[]>(HISTORIAL_KEY, fallback);
}

/** Estadísticas agregadas del jugador, calculadas desde logros, records e historial. */
export function useEstadisticas(): EstadisticasJugador {
  const logros = useLogrosDesbloqueados();
  const records = useRecords();
  const historial = useHistorial();

  return useMemo(() => {
    const distribucionRanks: Record<Rank, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const p of historial) {
      distribucionRanks[p.rank] = (distribucionRanks[p.rank] ?? 0) + 1;
    }

    const hace7Dias = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const partidasUltimos7Dias = historial.filter((p) => p.fecha >= hace7Dias).length;

    // Juego favorito: el que más partidas acumula en los records.
    let juegoFavorito: string | null = null;
    let maxPartidas = 0;
    for (const r of records) {
      if (r.partidas > maxPartidas) {
        maxPartidas = r.partidas;
        juegoFavorito = r.slug;
      }
    }

    return {
      totalPartidas: historial.length,
      distribucionRanks,
      logrosDesbloqueados: logros.length,
      logrosTotales: LOGROS.length,
      partidasUltimos7Dias,
      ultimaPartida: historial.length > 0 ? historial[historial.length - 1].fecha : null,
      juegoFavorito,
    };
  }, [logros, records, historial]);
}

export function reiniciarRecords() {
  guardar(RECORDS_KEY, []);
  guardar(LOGROS_KEY, []);
  guardar(HISTORIAL_KEY, []);
}

/* ------------------------------------------------------------------ */
/*  COMPARTIR (TEXTO E IMAGEN)                                          */
/* ------------------------------------------------------------------ */

export interface ResultadoCompartir {
  modo: "nativo" | "copiado" | "descargado" | "compartido" | "fallo";
}

export async function compartir({ titulo, texto }: { titulo: string; texto: string }): Promise<ResultadoCompartir> {
  const url = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
  const cuerpo = `${texto}\n${url}`;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: titulo, text: texto, url });
      return { modo: "nativo" };
    } catch {
      // Cancelado o error de share nativo
    }
  }
  try {
    await navigator.clipboard.writeText(cuerpo);
    return { modo: "copiado" };
  } catch {
    return { modo: "fallo" };
  }
}

/** Convierte un nodo DOM en tarjeta de imagen PNG para descargar o compartir como archivo. */
export async function compartirComoImagen(
  node: HTMLElement,
  filename = "bylesthergames-resultado.png"
): Promise<ResultadoCompartir> {
  try {
    const blob = await toBlob(node, { cacheBust: true, pixelRatio: 2 });
    if (!blob) throw new Error("No se pudo generar la imagen");

    const file = new File([blob], filename, { type: "image/png" });

    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "Mi resultado en ByLestherGames",
          text: "¡Mira mi desempeño en este Text RPG de negocios!",
          files: [file],
        });
        return { modo: "compartido" };
      } catch {
        // Fallback a descarga
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { modo: "descargado" };
  } catch {
    return { modo: "fallo" };
  }
}

export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export function linkX(texto: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`;
}

export function emojiRank(rank: Rank): string {
  return { S: "🏆", A: "🥈", B: "🥉", C: "😕", D: "💀" }[rank];
}
