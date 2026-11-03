"use client";

import { useState } from "react";

export default function NegociacionMaestraPage() {
  const [estado, setEstado] = useState({
    posicion: "abrir",
    relacion: 50,
    dinero: 1000,
    ofertas: 0,
    cierre: false,
  });

  const [escena, setEscena] = useState(1);

  const manejarDecision = (decision: number) => {
    const nuevo = { ...estado };

    if (decision === 1) {
      // Ceder precio
      nuevo.posicion = "ceder";
      nuevo.dinero -= 200;
      nuevo.relacion += 15;
      nuevo.ofertas += 1;
    } else if (decision === 2) {
      // Insistir en condiciones
      nuevo.posicion = "insistir";
      nuevo.relacion -= 10;
      nuevo.ofertas += 1;
    } else if (decision === 3) {
      // Ofrecer extras
      nuevo.posicion = "extras";
      nuevo.dinero -= 300;
      nuevo.relacion += 25;
      nuevo.ofertas += 1;
    } else if (decision === 4) {
      // Cerrar oferta
      nuevo.posicion = "cerrar";
      nuevo.cierre = true;
      nuevo.relacion += (nuevo.relacion > 60 ? 20 : 10);
    }

    setEstado(nuevo);
    setEscena((escena % 5) + 1);
  };

  if (escena > 5 || estado.cierre) {
    return (
      <div className="p-6 md:p-8 card-interactive max-w-2xl w-full">
        <h3 className="text-2xl font-bold text-white mb-4">
          {estado.cierre ? "¡Trato Cerrado!" : "Juego Finalizado"}
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Has completado la negociación. Tus resultados:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-white mb-1">Relación con cliente</p>
            <p className="text-3xl font-bold text-[var(--color-text-accent)]">{estado.relacion}%</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Dinero conseguido</p>
            <p className="text-3xl font-bold text-[var(--color-text-accent)]">${1000 + estado.dinero}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ofertas realizadas: {estado.ofertas}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 card-interactive max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Escena {escena}: Posición {estado.posicion}</h2>

      <p className="text-[var(--color-text-secondary)] mb-6">
        "Estás en una negociación de contrato con un cliente importante. El contrato vale $10,000 mensuales. Debes decidir tu estrategia."
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => manejarDecision(1)}
          className="btn-primary w-full"
        >
          [1] Ceder precio a cambio de mayor volumen
        </button>
        <button
          onClick={() => manejarDecision(2)}
          className="btn-secondary w-full"
        >
          [2] Insistir en condiciones originales
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => manejarDecision(3)}
          className="btn-primary w-full"
        >
          [3] Ofrecer extras o servicios adicionales
        </button>
        <button
          onClick={() => manejarDecision(4)}
          className="btn-secondary w-full"
        >
          [4] Cerrar la oferta actual
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-white mb-2">Métricas</h4>
          <p className="text-white">Relación: {estado.relacion}%</p>
          <p className="text-white">Dinero: ${1000 + estado.dinero}</p>
          <p className="text-white">Ofertas: {estado.ofertas}</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Posición Actual</h4>
          <p className="text-{estado.posicion === 'cerrar' ? 'var(--color-text-accent)' : 'var(--color-text-secondary)'}">
            {estado.posicion}
          </p>
        </div>
      </div>
    </div>
  );
}