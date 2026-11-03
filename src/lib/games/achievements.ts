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

  // --- Negociación ---
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
];

/* ------------------------------------------------------------------ */
/*  PERSISTENCIA LOCAL                                                  */
/* ------------------------------------------------------------------ */

const LOGROS_KEY = "games:logros";
const RECORDS_KEY = "games:records";
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
  metrica: number
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
  guardar(RECORDS_KEY, nuevos);
  return nuevos;
}

export function reiniciarRecords() {
  guardar(RECORDS_KEY, []);
  guardar(LOGROS_KEY, []);
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
