import Link from "next/link";
import { atencionCliente } from "@/lib/games/atencion-cliente";
import { negociacion } from "@/lib/games/negociacion";
import { cazadorLeads } from "@/lib/games/cazador-leads";
import PerfilJugador from "@/components/PerfilJugador";

const upcoming = [
  { icon: "📊", title: "Gestor de Cartera", desc: "20 clientes, recursos limitados. ¿A quién salvas primero?" },
  { icon: "💡", title: "Desarrollo de Producto", desc: "Features, presupuesto y un roadmap que grita." },
  { icon: "🚀", title: "Expansión Internacional", desc: "Un mercado nuevo decide si tu producto es global." },
  { icon: "💼", title: "Lider de Equipo", desc: "Motiva, asigna y sostén a tu escuadrón de ventas." },
];

function Dots({ n }: { n: number }) {
  return (
    <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-accent)]">
      {"◆".repeat(n)}
      <span className="text-white/20">{"◆".repeat(3 - n)}</span>
    </span>
  );
}

export default function HomePage() {
  const games = [atencionCliente, negociacion, cazadorLeads];

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(800px circle at 50% -10%, rgba(217,70,239,0.14), transparent 60%)",
          }}
        />
        <div className="relative max-w-[1100px] mx-auto px-6 pt-36 pb-16 md:pt-44 md:pb-24 text-center">
          <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-[var(--color-accent-lavender)] mb-6 animate-[fadeUp_.5s_ease-out]">
            Text RPGs · Decisiones con consecuencias
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-white mb-6 animate-[fadeUp_.6s_ease-out]">
            Tú tomas las decisiones.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C026D3] to-[#D946EF]">
              El juego cobra las cuentas.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 animate-[fadeUp_.7s_ease-out]">
            Simulaciones de texto sobre ventas, clientes y negociación. Sin gráficos,
            sin distracciones: solo tú, una escena y tres caminos que no vuelven atrás.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-[fadeUp_.8s_ease-out]">
            <Link href="/games/atencion-cliente" className="btn-primary text-base px-8">
              ▶ Jugar ahora
            </Link>
            <a href="#coleccion" className="btn-tertiary text-base px-8">
              Ver colección
            </a>
          </div>
        </div>
      </section>

      {/* PERFIL DEL JUGADOR (solo visible con partidas jugadas) */}
      <PerfilJugador />

      {/* COLECCIÓN */}
      <section id="coleccion" className="max-w-[1100px] mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-white">La colección</h2>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
              {games.length} disponibles · {upcoming.length} en desarrollo
            </p>
          </div>
          <span className="hidden md:block font-mono text-[11px] text-white/30 tracking-widest uppercase">
            actualizado semanalmente
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {games.map((g) => (
            <Link key={g.slug} href={`/games/${g.slug}`} className="game-card group">
              <div className="flex items-start justify-between mb-5">
                <span className="text-5xl">{g.icon}</span>
                <span className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
                  ● Disponible
                </span>
              </div>
              <h3 className="font-serif text-2xl text-white mb-2 group-hover:text-[#E879F9] transition-colors">
                {g.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
                {g.tagline}
              </p>
              <div className="flex items-center gap-5 font-mono text-[11px] text-white/40">
                <span>{g.category.toUpperCase()}</span>
                <Dots n={g.difficulty} />
                <span>~{g.minutes} MIN</span>
                <span className="ml-auto text-[var(--color-accent-lavender)] opacity-0 group-hover:opacity-100 transition-opacity">
                  JUGAR →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcoming.map((u) => (
            <div key={u.title} className="game-card game-card-locked">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl grayscale">{u.icon}</span>
                <span className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                  🔒 Próximamente
                </span>
              </div>
              <h3 className="font-serif text-xl text-white/80 mb-1.5">{u.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="border-t border-white/5 bg-[#0B0C15]">
        <div className="max-w-[1100px] mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-14">
            Tres reglas del juego
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                icon: "📖",
                title: "Lee la escena",
                desc: "Cada situación se escribe en tu pantalla como una conversación real, con presión y deadlines.",
              },
              {
                n: "02",
                icon: "⚡",
                title: "Decide sin red",
                desc: "Eliges una de tres opciones. Cada una mueve métricas visibles: satisfacción, margen, relación.",
              },
              {
                n: "03",
                icon: "🏁",
                title: "Cobra tu final",
                desc: "Tus decisiones acumuladas te llevan a un final con ranking: de D a S. ¿Puedes quedarte con el S?",
              },
            ].map((r) => (
              <div key={r.n} className="card-interactive">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl">{r.icon}</span>
                  <span className="font-mono text-sm text-[var(--color-accent-kinetic)]">{r.n}</span>
                </div>
                <h3 className="font-serif text-xl text-white mb-2">{r.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
