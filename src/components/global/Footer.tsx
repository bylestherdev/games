import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border-neutral)] py-10 mt-auto">
      <div className="max-w-[1100px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <Link href="/" className="font-bold text-lg text-white transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)] mb-1 inline-block">
            ByLesther<span className="text-[#D946EF]">Games</span>
          </Link>
          <p className="text-[var(--color-text-secondary)] text-sm">
            © {new Date().getFullYear()} By Lesther Dev · Simulaciones que enseñan vendiendo emoción.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/" className="text-[var(--color-text-secondary)] hover:text-white hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)] transition-all text-sm">
            Colección
          </Link>
          <Link href="/games/atencion-cliente" className="text-[var(--color-text-secondary)] hover:text-white hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)] transition-all text-sm">
            Atención al Cliente
          </Link>
          <Link href="/games/negociacion" className="text-[var(--color-text-secondary)] hover:text-white hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)] transition-all text-sm">
            Negociación
          </Link>
          <a href="https://github.com/bylestherdev" target="_blank" rel="noreferrer" className="text-[var(--color-text-secondary)] hover:text-white hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.75)] transition-all text-sm">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
