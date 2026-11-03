"use client";

import { useState } from "react";

export default function AtencionClientePage() {
  const [estado, setEstado] = useState({
    satisfaccion: 50,
    dinero: 0,
    clientes_resueltos: 0,
    clientes_irados: 0,
    nivel: 1,
  });

  const [escena, setEscena] = useState(1);

  const manejarDecision = (decision: number) => {
    const nuevo = { ...estado };

    if (decision === 1) {
      nuevo.satisfaccion += 20;
      nuevo.dinero += 50;
      nuevo.clientes_resueltos += 1;
    } else if (decision === 2) {
      nuevo.satisfaccion += 10;
      nuevo.dinero += 20;
      nuevo.clientes_resueltos += 1;
    } else if (decision === 3) {
      nuevo.satisfaccion += 30;
      nuevo.dinero -= 100;
      nuevo.clientes_resueltos += 1;
    } else if (decision === 4) {
      nuevo.satisfaccion -= 10;
      nuevo.dinero -= 50;
      nuevo.clientes_irados += 1;
    }

    setEstado(nuevo);
    setEscena((escena % 4) + 1);
  };

  if (escena > 4) {
    return (
      <div className="p-6 card-interactive">
        <h3 className="text-white mb-4">¡Gracias por jugar!</h3>
        <p className="text-[var(--color-text-secondary)]">
          Tus decisiones han marcado la diferencia. Sigue practicando para mejorar tus habilidades de atención al cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 card-interactive max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Escena {escena}</h2>

      <p className="text-[var(--color-text-secondary)] mb-6">
        "Llega una queja compleja de un cliente premium. Estás decidiendo cómo proceder."
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => manejarDecision(1)}
          className="btn-primary w-full"
        >
          [1] Atender rápido y ceder ofertas
        </button>
        <button
          onClick={() => manejarDecision(2)}
          className="btn-secondary w-full"
        >
          [2] Investigar causas profundas
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => manejarDecision(3)}
          className="btn-primary w-full"
        >
          [3] Ofrecer reembolso
        </button>
        <button
          onClick={() => manejarDecision(4)}
          className="btn-secondary w-full"
        >
          [4] Involucrar a gerentes
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-white mb-2">Estado Actual</h4>
          <p className="text-white">Satisfacción: {estado.satisfaccion}%</p>
          <p className="text-white">Recursos: ${estado.dinero}</p>
          <p className="text-white">Clientes resueltos: {estado.clientes_resueltos}</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Historial</h4>
          <p className="text-[var(--color-text-secondary)]">
            Irados: {estado.clientes_irados}
          </p>
        </div>
      </div>
    </div>
  );
}