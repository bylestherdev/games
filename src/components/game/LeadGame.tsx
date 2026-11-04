"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  calcularValorPipeline,
  contarCalificados,
  enfriarLeads,
  generarLeadsDia,
  resolverFinal,
  ejecutarAccionLead,
  accionDisponible,
  type Lead,
  type LeadGameData,
} from "@/lib/games/cazador-leads";
import type { TipoAccion } from "@/lib/games/cazador-leads";
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

type Phase = "intro" | "juego" | "ending";

export default function LeadGame({ game }: { game: LeadGameData }) {
  const [escenarioId, setEscenarioId] = useState<string>(game.escenarioInicial);
  const escenario = game.escenarios.find((e) => e.id === escenarioId) ?? game.escenarios[0];

  const [phase, setPhase] = useState<Phase>("intro");
  const [diaIdx, setDiaIdx] = useState(0);
  const [slotsRestantes, setSlotsRestantes] = useState(escenario.dias[0].slots);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [mensajeDia, setMensajeDia] = useState<string>("");
  const [logAcciones, setLogAcciones] = useState<string[]>([]);
  const [final, setFinal] = useState<ReturnType<typeof resolverFinal> | null>(null);
  const [nuevosLogros, setNuevosLogros] = useState<LogroRegistrado[]>([]);
  const [compartidoMsg, setCompartidoMsg] = useState<string | null>(null);

  const shareCardRef = useRef<HTMLDivElement>(null);

  const diaActual = escenario.dias[diaIdx];
  const pipeline = calcularValorPipeline(leads);
  const calificados = contarCalificados(leads);

  const iniciarJuego = useCallback(() => {
    const primerDia = escenario.dias[0];
    const iniciales = generarLeadsDia(primerDia, escenario.id);
    setDiaIdx(0);
    setSlotsRestantes(primerDia.slots);
    setLeads(iniciales);
    setMensajeDia(primerDia.evento);
    setLogAcciones([]);
    setFinal(null);
    setPhase("juego");
  }, [escenario]);

  const ejecutarAccion = (leadId: string, accionId: string) => {
    const accion = game.acciones.find((a) => a.id === accionId);
    if (!accion) return;
    if (slotsRestantes < accion.costeSlots) {
      setMensajeDia("⚠️ No te quedan slots suficientes hoy. Avanza al siguiente día.");
      return;
    }

    const target = leads.find((l) => l.id === leadId);
    if (!target) return;

    const res = ejecutarAccionLead(target, accionId as TipoAccion);
    const actualizado = res.lead ?? target;

    setLeads((prev) => prev.map((l) => (l.id === leadId ? actualizado : l)));
    setSlotsRestantes((s) => s - accion.costeSlots);
    setMensajeDia(res.texto);
    setLogAcciones((l) => [`[Día ${diaActual.dia}] ${target.empresa}: ${res.texto}`, ...l]);
  };

  const avanzarDia = () => {
    const enfriados = enfriarLeads(leads);
    const siguienteIdx = diaIdx + 1;

    if (siguienteIdx >= escenario.dias.length) {
      const pipeFinal = calcularValorPipeline(enfriados);
      const fin = resolverFinal(game.finales, enfriados, pipeFinal);
      setFinal(fin);
      setPhase("ending");

      const ctx = {
        rank: fin.rank,
        stats: { pipeline: pipeFinal, calificados: contarCalificados(enfriados), slotsUsados: 20 - slotsRestantes },
        decisiones: logAcciones.length,
        eventos: 0,
        flags: enfriados.every((l) => l.estado !== "descartado") ? ["sin-descartes"] : [],
      };

      const desbloqueables = LOGROS.filter((l) => l.juego === game.slug && cumpleLogro(l, ctx));
      const registrados = registrarLogros(game.slug, desbloqueables.map((l) => l.id));
      setNuevosLogros(registrados);

      registrarPartida(game.slug, fin.rank, pipeFinal, registrados.length);
    } else {
      const proxDia = escenario.dias[siguienteIdx];
      const nuevosLeads = generarLeadsDia(proxDia, escenario.id);
      const combinados = [
        ...enfriados.filter((l) => l.estado !== "descartado" && l.estado !== "enfriado"),
        ...nuevosLeads,
      ];
      setDiaIdx(siguienteIdx);
      setSlotsRestantes(proxDia.slots);
      setLeads(combinados);
      setMensajeDia(`Inicio de ${proxDia.titulo}. ${proxDia.evento}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 pt-28 md:pt-32">
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
        {phase === "juego" && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-5 py-4 border-b border-white/10 bg-[#0B0C15] font-mono text-xs">
            <div>
              <span className="text-white/40 block">Día</span>
              <span className="text-white font-bold">{diaActual.titulo}</span>
            </div>
            <div>
              <span className="text-white/40 block">Pipeline / Meta</span>
              <span className="text-emerald-400 font-bold">
                ${Math.round(pipeline).toLocaleString("es-CL")} / ${escenario.metaPipeline.toLocaleString("es-CL")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-white/40 block">Slots hoy</span>
              <span className="text-[var(--color-accent-kinetic)] font-bold">⚡ {slotsRestantes}</span>
            </div>
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

              {game.escenarios.length > 1 && (
                <div className="mb-8 max-w-md mx-auto">
                  <p className="text-xs font-mono text-white/40 mb-3 uppercase tracking-wider">Selecciona el escenario:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {game.escenarios.map((esc) => (
                      <button
                        key={esc.id}
                        onClick={() => setEscenarioId(esc.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          esc.id === escenarioId
                            ? "bg-[rgba(217,70,239,0.15)] border-[#D946EF] text-white"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/30"
                        }`}
                      >
                        <div className="font-serif text-base text-white mb-1">{esc.titulo}</div>
                        <div className="text-xs text-white/50">{esc.etiqueta} · Meta: ${esc.metaPipeline.toLocaleString("es-CL")}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto mb-8">
                {escenario.contexto}
              </p>

              <button onClick={iniciarJuego} className="btn-primary text-base px-10 py-4">
                ▶ Iniciar prospección ({escenario.etiqueta})
              </button>

              <p className="mt-6 font-mono text-[11px] text-white/30">
                DIFICULTAD {"◆".repeat(game.difficulty)}{"◇".repeat(3 - game.difficulty)} · ~{game.minutes} MIN
              </p>
            </div>
          )}

          {/* JUEGO */}
          {phase === "juego" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-xs text-white/80">
                📢 <span className="text-white font-medium">{mensajeDia}</span>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-white mb-4">Leads en tu bandeja ({leads.length})</h3>
                <div className="space-y-4">
                  {leads.map((l) => {
                    const estadoColor =
                      l.estado === "calificado"
                        ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                        : l.estado === "descartado" || l.estado === "enfriado"
                        ? "text-red-400 border-red-400/30 bg-red-400/10"
                        : "text-amber-400 border-amber-400/30 bg-amber-400/10";

                    return (
                      <div key={l.id} className="p-5 rounded-xl border border-white/10 bg-[#13141E] space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="font-serif text-xl text-white block">{l.empresa}</span>
                            <span className="font-mono text-xs text-white/50">{l.contacto} · Sector: {l.sector}</span>
                          </div>
                          <span className={`font-mono text-[10px] uppercase px-2.5 py-1 rounded-full border ${estadoColor}`}>
                            {l.estado} · {l.temperatura.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-sm text-white/70 italic font-mono">&ldquo;{l.resumen}&rdquo;</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-black/20 p-2.5 rounded-lg text-white/60">
                          <div>Presupuesto: <span className="text-white">{l.bant.presupuesto}%</span></div>
                          <div>Necesidad: <span className="text-white">{l.bant.necesidad}%</span></div>
                          <div>Autoridad: <span className="text-white">{l.bant.autoridad}%</span></div>
                          <div>Plazo: <span className="text-white">{l.bant.plazo}%</span></div>
                        </div>

                        {l.estado !== "descartado" && l.estado !== "enfriado" && l.estado !== "calificado" && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {game.acciones.map((acc) => {
                              const dis = accionDisponible(l, acc.id) && slotsRestantes >= acc.costeSlots;
                              return (
                                <button
                                  key={acc.id}
                                  disabled={!dis}
                                  onClick={() => ejecutarAccion(l.id, acc.id)}
                                  className={`btn-tertiary text-xs py-1.5 px-3 ${!dis ? "opacity-40 cursor-not-allowed" : ""}`}
                                  title={acc.hint}
                                >
                                  {acc.label} ({acc.costeSlots}⚡)
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="font-mono text-xs text-white/40">
                  Calificados: <strong className="text-white">{calificados}</strong> · Pipeline:{" "}
                  <strong className="text-emerald-400">${Math.round(pipeline).toLocaleString("es-CL")}</strong>
                </span>
                <button onClick={avanzarDia} className="btn-primary text-sm px-6 py-2.5">
                  Terminar día {diaActual.dia} →
                </button>
              </div>
            </div>
          )}

          {/* ENDING */}
          {phase === "ending" && final && (
            <div className="text-center py-6 animate-[fadeUp_.6s_ease-out]">
              {/* Tarjeta oculta para captura de imagen */}
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
                      {final.rank}
                    </div>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>
                        Pipeline Consolidado: ${Math.round(pipeline).toLocaleString("es-CL")}
                      </div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "26px", marginBottom: "8px" }}>
                        {final.title}
                      </div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: "1.4" }}>
                        {final.text.slice(0, 110)}...
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
                      🎮 ¿Puedes superar ${Math.round(pipeline).toLocaleString("es-CL")} de pipeline?
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#D946EF", letterSpacing: "0.05em" }}>
                      Juega gratis en games.bylesther.dev/games/{game.slug}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    <span>Clientes calificados: {calificados}</span>
                    <span style={{ color: "#D946EF" }}>games.bylesther.dev</span>
                  </div>
                </div>
              </div>

              <div className="rank-badge mb-6" style={{ boxShadow: `0 0 60px ${game.accent}66` }}>
                {final.rank}
              </div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/40 mb-2">
                Resultado de prospección
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">{final.title}</h2>
              <p className="text-white/80 leading-relaxed max-w-xl mx-auto mb-8">{final.text}</p>

              {nuevosLogros.length > 0 && (
                <div className="max-w-md mx-auto mb-8 p-4 rounded-xl border border-amber-400/30 bg-amber-400/10 text-left">
                  <p className="font-mono text-xs text-amber-400 uppercase mb-2">🏆 ¡Logros desbloqueados!</p>
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
              )}

              {/* Compartir */}
              <div className="mb-8 max-w-md mx-auto p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="font-mono text-xs text-white/50 mb-3 uppercase tracking-wider">Compartir tu resultado:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={async () => {
                      if (!shareCardRef.current) return;
                      const url = `${window.location.origin}/games/${game.slug}`;
                      const texto = `🎯 ¡Conseguí $${Math.round(pipeline).toLocaleString("es-CL")} de pipeline en "${game.title}" con rango ${final.rank}! ¿Puedes superarme? Juega gratis: ${url}`;
                      const res = await compartirTarjetaConTexto(shareCardRef.current, texto, `cazador-leads-rank-${final.rank}.png`);
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
                      const texto = `🎯 ¡Conseguí $${Math.round(pipeline).toLocaleString("es-CL")} de pipeline en "${game.title}" con rango ${final.rank}! ¿Puedes superarme? Juega gratis: ${url}`;
                      const res = await compartirTarjetaConTexto(shareCardRef.current, texto, `cazador-leads-rank-${final.rank}.png`);
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
                        titulo: `${game.title} — Rank ${final.rank}`,
                        texto: `🎯 ¡Conseguí $${Math.round(pipeline).toLocaleString("es-CL")} de pipeline en "${game.title}" con rango ${final.rank}! ¿Puedes superarme? Juega gratis: ${url}`,
                      });
                      setCompartidoMsg(res.modo === "copiado" ? "¡Texto copiado!" : res.modo === "nativo" ? "¡Compartido con éxito!" : "No se pudo compartir");
                      setTimeout(() => setCompartidoMsg(null), 3000);
                    }}
                    className="btn-tertiary text-xs py-2 px-4"
                  >
                    📋 Copiar texto
                  </button>
                </div>
                {compartidoMsg && <p className="mt-2 font-mono text-xs text-emerald-400">{compartidoMsg}</p>}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={iniciarJuego} className="btn-primary">
                  ↺ Jugar de nuevo
                </button>
                <Link href="/" className="btn-tertiary">
                  ← Volver a la colección
                </Link>
              </div>
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
