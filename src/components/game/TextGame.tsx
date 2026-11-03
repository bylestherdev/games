"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Ending, GameData, Scene, Stat } from "@/lib/games/types";
import {
  clearProgress,
  saveProgress,
  useSavedProgress,
  type DecisionLogEntry,
} from "@/lib/games/progress";

type Phase = "intro" | "scene" | "feedback" | "ending";

interface Delta {
  icon: string;
  label: string;
  delta: number;
  pct: number;
  money: boolean;
}

function initStats(game: GameData): Record<string, number> {
  const s: Record<string, number> = {};
  for (const st of game.stats) s[st.key] = st.initial ?? Math.round(st.max * 0.5);
  return s;
}

function resolveEnding(game: GameData, stats: Record<string, number>): Ending {
  for (const e of game.endings) {
    if (!e.conditions || e.conditions.length === 0) return e;
    const ok = e.conditions.every((c) => {
      const v = stats[c.stat] ?? 0;
      if (c.min !== undefined && v < c.min) return false;
      if (c.max !== undefined && v > c.max) return false;
      return true;
    });
    if (ok) return e;
  }
  return game.endings[game.endings.length - 1];
}

function formatValue(st: Pick<Stat, "format">, value: number): string {
  const rounded = Math.round(value);
  return st.format === "money" ? `$${rounded.toLocaleString("es-CL")}` : `${rounded}`;
}

export default function TextGame({ game }: { game: GameData }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [sceneId, setSceneId] = useState(game.start);
  const [stats, setStats] = useState<Record<string, number>>(() => initStats(game));
  const [log, setLog] = useState<DecisionLogEntry[]>([]);
  const [typed, setTyped] = useState(0);
  const [feedback, setFeedback] = useState<{
    choiceIdx: number;
    deltas: Delta[];
    result: string;
  } | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [shake, setShake] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);
  const saved = useSavedProgress(game.slug);

  const scene: Scene = game.scenes.find((s) => s.id === sceneId) ?? game.scenes[0];
  const fullText = phase === "scene" ? scene.text.join("\n\n") : "";
  const isTyping = phase === "scene" && typed < fullText.length;
  const savedScene = saved ? game.scenes.find((s) => s.id === saved.sceneId) : null;

  // Typewriter: el reinicio del contador vive en los handlers (no en el efecto),
  // para no disparar setState sincrónico dentro del efecto.
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

  // Limpieza de timers al desmontar.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (typer.current) clearInterval(typer.current);
    },
    []
  );

  const gotoEnding = useCallback(
    (finalStats: Record<string, number>) => {
      setEnding(resolveEnding(game, finalStats));
      setPhase("ending");
    },
    [game]
  );

  // Escena sin opciones = final. Se muestra el texto y luego el veredicto.
  useEffect(() => {
    if (phase !== "scene" || scene.choices.length > 0) return;
    if (typed < fullText.length) return;
    const t = setTimeout(() => gotoEnding(stats), 1800);
    return () => clearTimeout(t);
  }, [phase, scene.choices.length, typed, fullText.length, stats, gotoEnding]);

  const choose = useCallback(
    (idx: number) => {
      const choice = scene.choices[idx];
      if (!choice) return;
      if (timer.current) clearTimeout(timer.current);

      const next = { ...stats };
      const deltas: Delta[] = choice.effects.map((e) => {
        const st = game.stats.find((s) => s.key === e.stat)!;
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

      const nextLog = [...log, { label: choice.label, result: choice.result, n: log.length + 1 }];

      setStats(next);
      setShake((x) => x + 1);
      setFeedback({ choiceIdx: idx, deltas, result: choice.result });
      setPhase("feedback");
      setLog(nextLog);

      timer.current = setTimeout(() => {
        if (choice.next === "END") {
          saveProgress({
            slug: game.slug,
            phase: "ending",
            sceneId: scene.id,
            stats: next,
            log: nextLog,
            savedAt: Date.now(),
          });
          gotoEnding(next);
        } else {
          setTyped(0);
          setSceneId(choice.next);
          setFeedback(null);
          setPhase("scene");
          saveProgress({
            slug: game.slug,
            phase: "scene",
            sceneId: choice.next,
            stats: next,
            log: nextLog,
            savedAt: Date.now(),
          });
        }
      }, 2600);
    },
    [scene, stats, log, game, gotoEnding]
  );

  const skipToEndOfText = useCallback(() => {
    if (phase === "scene" && typed < fullText.length) setTyped(fullText.length);
  }, [phase, typed, fullText.length]);

  const start = useCallback(() => {
    clearProgress(game.slug);
    setStats(initStats(game));
    setLog([]);
    setSceneId(game.start);
    setEnding(null);
    setFeedback(null);
    setTyped(0);
    setPhase("scene");
  }, [game]);

  const continueSaved = useCallback(() => {
    if (!saved) return;
    setStats(saved.stats);
    setLog(saved.log);
    setSceneId(saved.sceneId);
    setTyped(0);
    setFeedback(null);
    if (saved.phase === "ending") {
      setEnding(resolveEnding(game, saved.stats));
      setPhase("ending");
    } else {
      setEnding(null);
      setPhase("scene");
    }
  }, [saved, game]);

  const restart = useCallback(() => {
    clearProgress(game.slug);
    setStats(initStats(game));
    setLog([]);
    setSceneId(game.start);
    setEnding(null);
    setFeedback(null);
    setTyped(0);
    setPhase("scene");
  }, [game]);

  // Atajos de teclado: 1-3 eligen, Enter/Espacio saltan la escritura, R reinicia.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
        // Si el foco está en un botón, el Enter/Espacio nativo ya lo activa.
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
  }, [phase, isTyping, scene.choices.length, choose, skipToEndOfText, saved, continueSaved, start, restart]);

  const visibleText = fullText.slice(0, typed);

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
            {game.icon} {game.slug} — bylesther.dev/games
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            EN LÍNEA
          </span>
        </div>

        {/* Stats bar */}
        {(phase === "scene" || phase === "feedback") && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-5 py-4 border-b border-white/10 bg-[#0B0C15]">
            {game.stats.map((st) => {
              const val = stats[st.key] ?? 0;
              const pct = Math.min(100, (val / st.max) * 100);
              return (
                <div key={st.key} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-1 text-[10px] sm:text-[11px] font-mono text-white/50 mb-1.5">
                    <span className="truncate" title={st.label}>
                      {st.icon} {st.label}
                    </span>
                    <span className="shrink-0 text-white/80">{formatValue(st, val)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg,#C026D3,#D946EF)",
                        boxShadow: "0 0 12px rgba(217,70,239,.5)",
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
              <div className="text-6xl mb-6">{game.icon}</div>
              <h1 className="font-serif text-4xl md:text-5xl text-white mb-3">{game.title}</h1>
              <p className="text-[var(--color-text-accent)] font-mono text-sm mb-8 tracking-wide">{game.tagline}</p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto mb-10">
                {game.description}
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                {saved && savedScene ? (
                  <>
                    <button onClick={continueSaved} className="btn-primary text-base px-8 py-3.5">
                      ▶ Continuar: {savedScene.title}
                    </button>
                    <button onClick={start} className="btn-tertiary text-base px-8 py-3.5">
                      Empezar de cero
                    </button>
                  </>
                ) : (
                  <button onClick={start} className="btn-primary text-base px-10 py-4">
                    ▶ Iniciar simulación
                  </button>
                )}
              </div>

              {saved && savedScene && (
                <p className="mt-5 font-mono text-[11px] text-white/30">
                  Partida guardada · {saved.log.length} decisiones ·{" "}
                  {new Date(saved.savedAt).toLocaleString("es-CL", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              <p className="mt-6 font-mono text-[11px] text-white/30">
                DIFICULTAD {"◆".repeat(game.difficulty)}
                {"◇".repeat(3 - game.difficulty)} · ~{game.minutes} MIN
              </p>
            </div>
          )}

          {/* SCENE */}
          {phase === "scene" && (
            <div onClick={skipToEndOfText} className="cursor-pointer">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] tracking-widest text-[var(--color-accent-kinetic)] uppercase">
                  {scene.chapter}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">{scene.title}</h2>

              {/* Texto completo para lectores de pantalla (el typewriter va aria-hidden) */}
              <p className="sr-only">{fullText}</p>
              <p
                aria-hidden="true"
                className="text-lg leading-relaxed text-white/85 whitespace-pre-line min-h-[120px] font-mono"
              >
                {visibleText}
                {isTyping && <span className="caret" />}
              </p>

              {isTyping && (
                <p className="mt-4 font-mono text-[11px] text-white/30 animate-pulse">
                  pulsa Enter o haz clic para saltar la escritura…
                </p>
              )}

              {!isTyping && scene.choices.length > 0 && (
                <div className="mt-8 space-y-3 animate-[fadeUp_.4s_ease-out]">
                  {scene.choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        choose(i);
                      }}
                      aria-keyshortcuts={String(i + 1)}
                      className="choice group w-full text-left"
                    >
                      <span className="choice-idx">[{String(i + 1).padStart(2, "0")}]</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-white group-hover:text-white transition-colors">
                          {c.label}
                        </span>
                        {c.hint && (
                          <span className="block text-xs text-white/35 mt-0.5 font-mono">↳ {c.hint}</span>
                        )}
                      </span>
                      <span className="choice-arrow">→</span>
                    </button>
                  ))}
                  <p className="pt-1 font-mono text-[11px] text-white/25">
                    atajo: teclas <span className="kbd">1</span> <span className="kbd">2</span>{" "}
                    <span className="kbd">3</span> para elegir
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK */}
          {phase === "feedback" && feedback && (
            <div className="animate-[fadeUp_.3s_ease-out]" key={shake}>
              <div className="font-mono text-xs text-white/40 tracking-widest uppercase mb-4">
                {"> Decisión "}
                {String(feedback.choiceIdx + 1).padStart(2, "0")} registrada
              </div>
              <div role="status" aria-live="polite">
                <p className="font-serif text-2xl md:text-3xl text-white leading-snug mb-8 border-l-2 border-[var(--color-accent-kinetic)] pl-5">
                  {feedback.result}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {feedback.deltas.map((d, i) => (
                    <span key={i} className={`delta-chip ${d.delta >= 0 ? "delta-up" : "delta-down"}`}>
                      {d.icon} {d.label} {d.delta >= 0 ? "+" : "−"}
                      {d.money ? `$${Math.abs(d.delta).toLocaleString("es-CL")}` : Math.abs(d.delta)}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-8 font-mono text-[11px] text-white/30 animate-pulse">
                procesando siguiente escena…
              </p>
            </div>
          )}

          {/* ENDING */}
          {phase === "ending" && ending && (
            <div className="text-center py-6 animate-[fadeUp_.6s_ease-out]">
              <div className="rank-badge mb-6" style={{ boxShadow: `0 0 60px ${game.accent}66` }}>
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
              <p className="text-white/80 leading-relaxed max-w-xl mx-auto mb-10">{ending.text}</p>

              {/* Historial de decisiones */}
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

              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={restart} className="btn-primary">
                  ↺ Jugar de nuevo
                </button>
                <Link href="/" className="btn-tertiary">
                  ← Volver a la colección
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
