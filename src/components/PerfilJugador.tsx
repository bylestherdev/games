"use client";

import { useEstadisticas, useLogrosDesbloqueados, LOGROS, emojiRank, type Rank } from "@/lib/games/achievements";

const RANKS: Rank[] = ["S", "A", "B", "C", "D"];

const NOMBRES_JUEGOS: Record<string, string> = {
  "atencion-cliente": "Atención al Cliente",
  negociacion: "Negociación",
  "cazador-leads": "Cazador de Leads",
};

export default function PerfilJugador() {
  const stats = useEstadisticas();
  const logros = useLogrosDesbloqueados();

  // Sin partidas todavía: no mostramos el panel (la home queda limpia para nuevos jugadores).
  if (stats.totalPartidas === 0) return null;

  const pctLogros = Math.round((stats.logrosDesbloqueados / stats.logrosTotales) * 100);
  const maxRank = RANKS.reduce(
    (max, r) => Math.max(max, stats.distribucionRanks[r]),
    0
  );
  const ultimosLogros = [...logros].sort((a, b) => b.fecha - a.fecha).slice(0, 3);

  return (
    <section className="max-w-[1100px] mx-auto px-6 pb-20">
      <div className="rounded-2xl border border-white/10 bg-[#0E0F1A] overflow-hidden">
        {/* Header tipo terminal */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10 bg-[#13141E]">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] shrink-0" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E] shrink-0" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] shrink-0" />
          <span className="ml-2 font-mono text-[11px] text-white/50 tracking-widest uppercase">
            perfil_jugador.log — tus estadísticas
          </span>
        </div>

        <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: partidas y ranks */}
          <div>
            <p className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-4">
              Partidas terminadas
            </p>
            <p className="font-serif text-5xl text-white mb-1">{stats.totalPartidas}</p>
            <p className="font-mono text-[11px] text-white/40 mb-6">
              {stats.partidasUltimos7Dias} en los últimos 7 días
            </p>

            <p className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-3">
              Distribución de ranks
            </p>
            <div className="space-y-2">
              {RANKS.map((r) => {
                const n = stats.distribucionRanks[r];
                const pct = maxRank > 0 ? (n / maxRank) * 100 : 0;
                return (
                  <div key={r} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-white/60 w-8 shrink-0">
                      {emojiRank(r)} {r}
                    </span>
                    <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          r === "S" ? "bg-gradient-to-r from-[#C026D3] to-[#D946EF]" : "bg-white/30"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-white/50 w-6 text-right shrink-0">
                      {n}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna 2: logros */}
          <div>
            <p className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-4">
              Logros desbloqueados
            </p>
            <p className="font-serif text-5xl text-white mb-1">
              {stats.logrosDesbloqueados}
              <span className="text-white/30 text-2xl">/{stats.logrosTotales}</span>
            </p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-700"
                style={{ width: `${pctLogros}%` }}
              />
            </div>
            <p className="font-mono text-[11px] text-white/40 mb-6">{pctLogros}% de la colección</p>

            {ultimosLogros.length > 0 && (
              <>
                <p className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-3">
                  Últimos conseguidos
                </p>
                <div className="space-y-2.5">
                  {ultimosLogros.map((l) => {
                    const item = LOGROS.find((x) => x.id === l.id);
                    if (!item) return null;
                    return (
                      <div key={l.id} className="flex items-center gap-2.5">
                        <span className="text-lg shrink-0">{item.icono}</span>
                        <span className="text-xs text-white/70 truncate">{item.nombre}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Columna 3: actividad */}
          <div>
            <p className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-4">
              Actividad
            </p>
            {stats.juegoFavorito && (
              <div className="mb-5">
                <p className="font-mono text-[11px] text-white/40 mb-1">Juego favorito</p>
                <p className="text-sm text-white">
                  {NOMBRES_JUEGOS[stats.juegoFavorito] ?? stats.juegoFavorito}
                </p>
              </div>
            )}
            {stats.ultimaPartida && (
              <div className="mb-5">
                <p className="font-mono text-[11px] text-white/40 mb-1">Última partida</p>
                <p className="text-sm text-white">
                  {new Date(stats.ultimaPartida).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
            <div className="mt-6 p-3 rounded-xl border border-[#D946EF]/30 bg-[rgba(217,70,239,0.08)]">
              <p className="text-xs text-white/70 leading-relaxed">
                {stats.distribucionRanks.S > 0
                  ? `🏆 Ya tienes ${stats.distribucionRanks.S} final${stats.distribucionRanks.S > 1 ? "es" : ""} perfecto${stats.distribucionRanks.S > 1 ? "s" : ""}. ¿Puedes conseguir más?`
                  : "🎯 Aún no consigues un final S. ¡Vuelve a jugar y demuestra tu nivel!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
