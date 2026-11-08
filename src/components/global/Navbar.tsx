"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("business");

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

  return (
    <header className="fixed top-0 left-0 w-full md:top-4 md:left-1/2 md:-translate-x-1/2 md:max-w-[1100px] isolate z-[100] px-0 md:px-4 bg-[var(--color-canvas)] transition-colors">
      <div className="w-full px-5 sm:px-6 h-16 md:h-16 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--color-canvas)]">
        <Link
          href="/"
          onClick={() => setCategory("business")}
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
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil - aparece al hacer click en hamburguesa */}
      <div
        className={`fixed inset-0 z-[90] md:hidden bg-[var(--color-canvas)] overflow-y-auto transition-all duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between h-16 border-b border-[var(--border-subtle)] bg-[var(--color-canvas)]">
          <Link href="/" onClick={() => { setCategory("business"); setOpen(false); }} className="font-bold text-xl text-white">
            ByLesther<span className="text-[#D946EF]">Games</span>
          </Link>
          {/* Botón cerrar - SOLO este en el menú móvil */}
          <button onClick={() => setOpen(false)} className="text-white p-2" aria-label="Cerrar menú">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 flex flex-col justify-center gap-2 px-6 py-6">
          {Object.entries(categories).map(([key, cat]) => (
            <div key={key} className="mb-4">
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-2">{cat.label}</p>
              {cat.games.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => { setCategory(key); setOpen(false); }}
                  className="text-white text-base font-medium py-4 border-b border-white/10"
                >
                  {l.label}
                </Link>
              ))}
              {key === "business" && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Juegos de Negocios:</p>
                  {categories.business.games.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => { setCategory("business"); setOpen(false); }}
                      className="text-xs text-gray-300 hover:text-white mb-1 block"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href="https://bylesther.dev" target="_blank" rel="noreferrer" className="text-[#C084FC] text-xl font-medium py-4 mt-4">
            bylesther.dev ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
