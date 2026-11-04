"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Colección" },
    { href: "/games/atencion-cliente", label: "Atención al Cliente" },
    { href: "/games/negociacion", label: "Negociación" },
    { href: "/games/cazador-leads", label: "Cazador de Leads" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full md:top-4 md:left-1/2 md:-translate-x-1/2 md:max-w-[1100px] isolate z-[100] px-0 md:px-4">
      <div className="w-full px-5 sm:px-6 bg-[rgba(26,20,17,0.85)] backdrop-blur-[14px] border-0 md:border md:border-[var(--border)] rounded-none md:rounded-[2rem] h-16 md:h-16 flex items-center justify-between shadow-xl">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-bold text-xl tracking-tight text-white transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)]"
        >
          ByLesther<span className="text-[#D946EF]">Games</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-400 transition-all duration-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)]"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://bylesther.dev"
            target="_blank"
            rel="noreferrer"
            className="btn-primary py-2 px-5 text-xs"
          >
            bylesther.dev ↗
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="md:hidden text-[var(--color-text-secondary)] hover:text-white p-2"
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

      {/* Menú móvil */}
      <div
        className={`fixed inset-0 bg-[var(--color-canvas)] z-[90] md:hidden flex flex-col px-6 py-6 transition-all duration-300 ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between h-16">
          <Link href="/" onClick={() => setOpen(false)} className="font-bold text-xl text-white">
            ByLesther<span className="text-[#D946EF]">Games</span>
          </Link>
          <button onClick={() => setOpen(false)} className="text-white p-2" aria-label="Cerrar menú">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 flex flex-col justify-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white text-xl font-medium py-4 border-b border-white/10"
            >
              {l.label}
            </Link>
          ))}
          <a href="https://bylesther.dev" target="_blank" rel="noreferrer" className="text-[#C084FC] text-xl font-medium py-4">
            bylesther.dev ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
