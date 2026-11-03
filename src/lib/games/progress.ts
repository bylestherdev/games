"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export interface DecisionLogEntry {
  label: string;
  result: string;
  n: number;
}

export interface SavedProgress {
  slug: string;
  phase: "scene" | "ending";
  sceneId: string;
  stats: Record<string, number>;
  log: DecisionLogEntry[];
  savedAt: number;
}

const PREFIX = "games:progress:";
const CHANGE_EVENT = "games:progress-change";

export const progressKey = (slug: string) => `${PREFIX}${slug}`;

function read(slug: string): string | null {
  try {
    return window.localStorage.getItem(progressKey(slug));
  } catch {
    return null;
  }
}

function parse(raw: string | null): SavedProgress | null {
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
    window.localStorage.setItem(progressKey(progress.slug), JSON.stringify(progress));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Sin persistencia disponible: el juego sigue funcionando, solo no se puede continuar.
  }
}

export function clearProgress(slug: string) {
  try {
    window.localStorage.removeItem(progressKey(slug));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Ignorar: no hay nada que limpiar.
  }
}

/**
 * Lee la partida guardada sin provocar errores de hidratación:
 * durante el render inicial devuelve el snapshot del servidor (null) y
 * React actualiza al snapshot real del navegador después de hidratar.
 */
export function useSavedProgress(slug: string): SavedProgress | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const key = progressKey(slug);
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
    [slug]
  );

  const getSnapshot = useCallback(() => read(slug), [slug]);
  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parse(raw), [raw]);
}
