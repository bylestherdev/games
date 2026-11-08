"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("business");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Categorías de juegos
  const categories = {
    business: {
      label: "💼 Negocios/Actuales",
      games: [
        { href: "/games/negociacion", label: "Negociación Maestra" },
        { href: "/games/atencion-cliente", label: "Atención al Cliente" },
        { href: "/games/cazador-leads", label: "Cazador de Leads" },
        { href: "/games/lider-equipo", label: "Lider de Equipo" },
        { href: "/games/gestor-cartera", label: "Gestor de Cartera" },
        { href: "/games/desarrollo-producto", label: "Desarrollo de Producto" },
        { href: "/games/expansion-internacional", label: "Expansión Internacional" },
      ]
    },
    races: {
      label: "🏁 Carreras",
      games: [
        { href: "/games/carreras-desarrollador", label: "Carrera Desarrollador" },
        { href: "/games/pokemon-copa", label: "Copa Mundial Pokémon" },
      ]
    },
    logic: {
      label: "🧠 Lógica",
      games: []
    },
    quiz: {
      label: "❓ Quiz Desarrollo",
      games: []
    },
  };

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 w-full md:top-4 md:left-1/2 md:-translate-x-1/2 md:max-w-[1100px] isolate z-[100] px-0 md:px-4 bg-[var(--color-canvas)]">
        <div className="w-full px-5 sm:px-6 h-16 md:h-16 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--color-canvas)]">
          <Link href="/" className="font-bold text-xl tracking-tight text-white">
            ByLesther<span className="text-[#D946EF]">Games</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 w-full md:top-4 md:left-1/2 md:-translate-x-1/2 md:max-w-[1100px] isolate z-[100] px-0 md:px-4 bg-[var(--color-canvas)]">
      <div className="w-full px-5 sm:px-6 h-16 md:h-16 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--color-canvas)]">
        <Link
          href="/"
          onClick={() => { setCategory("business"); }}
          className="font-bold text-xl tracking-tight text-white transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)]"
        >
          ByLesther<span className="text-[#D946EF]">Games</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {Object.entries(categories).map(([key, cat]) => (
            <Link
              key={key}
              href="#"
              onClick={() => setCategory(key)}
              className="text-sm text-gray-400 transition-all duration-200 hover:text-white drop-shadow-[0_0_8px_rgba(217,70,239,0.75)]"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://bylesther.dev"
            target="_blank"
            rel="noreferrer"
            className="btn-primary py-2 px-5 text-xs"
          >
            bylesther.dev ↗
          </a>

          {/* Hamburger button - solo mobile */}
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="md:hidden text-white p-2"
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[89] md:hidden bg-black/50 transition-opacity duration-300"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menú móvil - Panel slide-in desde la derecha */}
      <aside
        className={`fixed inset-y-0 right-0 z-[90] md:hidden w-full max-w-sm bg-[var(--color-canvas)] shadow-[-4px_0_30px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Menú de navegación"
      >
        {/* Header del panel */}
        <div className="flex items-center justify-between h-16 border-b border-[var(--border-subtle)] bg-[var(--color-canvas)]">
          <Link href="/" onClick={() => setOpen(false)} className="font-bold text-xl text-white px-6">
            ByLesther<span className="text-[#D946EF]">Games</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-white p-2 pr-6"
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del menú */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {Object.entries(categories).map(([key, cat]) => (
            <div key={key}>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-4">{cat.label}</p>
              
              {cat.games.length > 0 ? (
                <ul className="space-y-2">
                  {cat.games.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-white font-medium hover:bg-[var(--negotiation-warm)] hover:border-[var(--negotiation-warm)] transition-all duration-200"
                      >
                        <span>{l.label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 py-4">Próximamente...</p>
              )}

              {key === "business" && (
                <details className="group mt-4">
                  <summary className="flex items-center justify-between cursor-pointer px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-white font-medium list-none">
                    <span>Juegos de Negocios</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <ul className="mt-2 space-y-1 pl-2">
                    {categories.business.games.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[var(--negotiation-warm)] rounded transition-all duration-200"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
          
          <div className="pt-6 border-t border-[var(--border-subtle)]">
            <a 
              href="https://bylesther.dev" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-primary w-full justify-center"
            >
              bylesther.dev ↗
            </a>
          </div>
        </nav>
      </aside>
    </header>
  );
}
