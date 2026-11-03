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
  compartirComoImagen,
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
  const scene: Scene = escenario.escenas.find((s) => s.id === sceneId) ?? escenario.escenas[0];
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

      const metricaPrincipal = finalStats[escenario.stats[0]?.key] ?? 0;
      registrarPartida(game.slug, fin.rank, metricaPrincipal);

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
    [scene.choices, stats, escenario.stats, flags, log]
  );

  const avanzarDesdeFeedback = useCallback(() => {
    if (!feedback) return;
    if (feedback.isEnd) {
      gotoEnding(stats, log, flags, eventosDisparados);
    } else {
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
    }
  }, [feedback, stats, log, flags, eventosDisparados, checkSurpriseEvent, game.slug, escenarioId, gotoEnding]);

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

        {/* Stats bar */}
        {(phase === "scene" || phase === "feedback" || phase === "event") && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-5 py-4 border-b border-white/10 bg-[#0B0C15]">
            {escenario.stats.map((st) => {
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
                      className="choice group w-full text-left"
                    >
                      <span className="choice-idx">[{String(i + 1).padStart(2, "0")}]</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-white group-hover:text-white transition-colors">{c.label}</span>
                        {c.hint && <span className="block text-xs text-white/35 mt-0.5 font-mono">↳ {c.hint}</span>}
                      </span>
                      <span className="choice-arrow">→</span>
                    </button>
                  ))}
                  <p className="pt-1 font-mono text-[11px] text-white/25">
                    atajo: teclas <span className="kbd">1</span> <span className="kbd">2</span> <span className="kbd">3</span> para elegir
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
                  <button onClick={cerrarEvento} className="btn-primary">
                    Continuar simulación →
                  </button>
                </div>
              ) : currentEvent.opciones && currentEvent.opciones.length > 0 ? (
                <div className="space-y-3">
                  {currentEvent.opciones.map((op, i) => (
                    <button
                      key={i}
                      onClick={() => manejarOpcionEvento(op.effects, op.resultado)}
                      className="choice group w-full text-left border-amber-400/30 hover:border-amber-400"
                    >
                      <span className="choice-idx text-amber-400">[{String(i + 1).padStart(2, "0")}]</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-white">{op.label}</span>
                        {op.hint && <span className="block text-xs text-white/40 mt-0.5 font-mono">↳ {op.hint}</span>}
                      </span>
                      <span className="choice-arrow text-amber-400">→</span>
                    </button>
                  ))}
                </div>
              ) : (
                <button onClick={cerrarEvento} className="btn-primary">
                  Entendido, seguir →
                </button>
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
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {feedback.deltas.map((d, i) => (
                    <span key={i} className={`delta-chip ${d.delta >= 0 ? "delta-up" : "delta-down"}`}>
                      {d.icon} {d.label} {d.delta >= 0 ? "+" : "−"}
                      {d.money ? `$${Math.abs(d.delta).toLocaleString("es-CL")}` : Math.abs(d.delta)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                <button onClick={avanzarDesdeFeedback} className="btn-primary text-base px-8 py-3.5">
                  Siguiente escena →
                </button>
                <span className="font-mono text-xs text-white/40">
                  Pulsa <span className="kbd">Enter</span> o <span className="kbd">Espacio</span>
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

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    <span>Decisiones tomadas: {log.length}</span>
                    <span style={{ color: "#D946EF" }}>games.bylesther.dev</span>
                  </div>
                </div>
              </div>

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
                      const res = await compartirComoImagen(shareCardRef.current, `${game.slug}-resultado-rank-${ending.rank}.png`);
                      setCompartidoMsg(res.modo === "compartido" ? "¡Imagen compartida!" : res.modo === "descargado" ? "¡Tarjeta de imagen descargada!" : "No se pudo generar la imagen");
                      setTimeout(() => setCompartidoMsg(null), 3500);
                    }}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    📸 Descargar tarjeta de resultado (PNG)
                  </button>
                  <button
                    onClick={async () => {
                      const res = await compartir({
                        titulo: `${game.title} — Rank ${ending.rank}`,
                        texto: `¡Terminé "${game.title}" en games.bylesther.dev con rango ${ending.rank} (${ending.title})! 🚀`,
                      });
                      setCompartidoMsg(res.modo === "copiado" ? "¡Enlace copiado al portapapeles!" : res.modo === "nativo" ? "¡Compartido con éxito!" : "No se pudo compartir");
                      setTimeout(() => setCompartidoMsg(null), 3000);
                    }}
                    className="btn-tertiary text-xs py-2 px-4"
                  >
                    📋 Copiar texto
                  </button>
                  <a
                    href={linkWhatsApp(`¡Terminé "${game.title}" en games.bylesther.dev con rango ${ending.rank} (${ending.title})! 🚀`)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp text-xs py-2 px-4"
                  >
                    💬 WhatsApp ↗
                  </a>
                  <a
                    href={linkX(`¡Terminé "${game.title}" en games.bylesther.dev con rango ${ending.rank} (${ending.title})! 🚀`)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-tertiary text-xs py-2 px-4"
                  >
                    𝕏 Twitter ↗
                  </a>
                </div>
                {compartidoMsg && (
                  <p className="mt-2 font-mono text-xs text-emerald-400 animate-pulse">{compartidoMsg}</p>
                )}
              </div>

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
