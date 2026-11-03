export default function HomePage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl text-center space-y-8">
        {/* Header */}
        <div className="card-interactive p-6 md:p-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Games bylesther.dev
          </h1>
          <p className="text-2xl md:text-3xl text-[var(--color-text-secondary)] mb-8">
            Plataforma de Text RPGs basados en decisiones
          </p>
        </div>

        {/* Categorías Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
          <a href="/games/negociacion" className="group card-interactive hover:bg-[var(--color-surface-hover)] transition-colors">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">🤝 Negociación Maestra</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Simulador de contratos y cierre de ventas</p>
            </div>
          </a>

          <a href="/games/gestion" className="group card-interactive hover:bg-[var(--color-surface-hover)] transition-colors">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">📊 Gestor de Cartera</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Administración de relaciones cliente</p>
            </div>
          </a>

          <a href="/games/producto" className="group card-interactive hover:bg-[var(--color-surface-hover)] transition-colors">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">💡 Desarrollo Producto</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Decisiones sobre features y roadmap</p>
            </div>
          </a>
        </div>

        {/* Categorías Secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 max-w-2xl">
          <a href="/games/atencion-cliente" className="group card-interactive hover:bg-[var(--color-surface-hover)] transition-colors">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">🌟 Atención al Cliente</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Resolución de quejas y retención</p>
            </div>
          </a>

          <a href="/games/leads" className="group card-interactive hover:bg-[var(--color-surface-hover)] transition-colors">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">🎯 Cazador de Leads</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Prospección y calificación de oportunidades</p>
            </div>
          </a>

          <a href="/games/internacional" className="group card-interactive hover:bg-[var(--color-surface-hover)] transition-colors">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">🚀 Expansión Internacional</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Nuevos mercados y culturas</p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}