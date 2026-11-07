"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export interface DecisionLogEntry {
  label: string;
  result: string;
  n: number;
}

export interface SavedProgress {
  slug: string;
  /** Escenario (o sub-partida) al que pertenece el guardado. */
  scope?: string;
  phase: "scene" | "ending";
  sceneId: string;
  stats: Record<string, number>;
  log: DecisionLogEntry[];
  savedAt: number;
  /** Datos extra del juego (flags, eventos vistos, seed, etc.). */
  payload?: unknown;
}

const PREFIX = "games:progress:";
const CHANGE_EVENT = "games:progress-change";

export const progressKey = (slug: string, scope?: string) =>
  scope ? `${PREFIX}${slug}:${scope}` : `${PREFIX}${slug}`;

export function parse(raw: string | null): SavedProgress | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SavedProgress;
    if (!data || typeof data.slug !== "string") return null;
    if (typeof data.sceneId !== "string" || !data.stats) return null;
    if (!Array.isArray(data.log)) return null;
    return data;
  } catch {
    return null;
  }
}

/** Guarda la partida en localStorage. Silencia los fallos (modo privado, cuota llena). */
export function saveProgress(progress: SavedProgress) {
  try {
    window.localStorage.setItem(
      progressKey(progress.slug, progress.scope),
      JSON.stringify(progress)
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Sin persistencia disponible: el juego sigue funcionando, solo no se puede continuar.
  }
}

export function clearProgress(slug: string, scope?: string) {
  try {
    window.localStorage.removeItem(progressKey(slug, scope));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Ignorar: no hay nada que limpiar.
  }
}

/**
 * Lee una partida guardada sin provocar errores de hidratación:
 * durante el render inicial devuelve el snapshot del servidor (null) y
 * React actualiza al snapshot real del navegador después de hidratar.
 */
export function useSavedProgress(slug: string, scope?: string): SavedProgress | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const key = progressKey(slug, scope);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) onChange();
      };
      const onLocalChange = () => onChange();
      window.addEventListener("storage", onStorage);
      window.addEventListener(CHANGE_EVENT, onLocalChange);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(CHANGE_EVENT, onLocalChange);
      };
    },
    [slug, scope]
  );

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(progressKey(slug, scope));
    } catch {
      return null;
    }
  }, [slug, scope]);
  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parse(raw), [raw]);
}

/** Todos los guardados de un juego, indexados por escenario. */
export function useProgresses(slug: string): Record<string, SavedProgress> {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = () => onChange();
      const onLocalChange = () => onChange();
      window.addEventListener("storage", onStorage);
      window.addEventListener(CHANGE_EVENT, onLocalChange);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(CHANGE_EVENT, onLocalChange);
      };
    },
    []
  );

  const getSnapshot = useCallback(() => {
    try {
      const out: Record<string, SavedProgress> = {};
      const prefijo = `${PREFIX}${slug}`;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(prefijo)) continue;
        const p = parse(window.localStorage.getItem(key));
        if (p) out[p.scope ?? ""] = p;
      }
      return JSON.stringify(out);
    } catch {
      return "{}";
    }
  }, [slug]);
  const getServerSnapshot = useCallback(() => "{}", []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    try {
      return JSON.parse(raw) as Record<string, SavedProgress>;
    } catch {
      return {};
    }
  }, [raw]);
}
