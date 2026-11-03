"use client";

import { useState } from "react";

export default function AtencionClientePage() {
  const [estado, setEstado] = useState({
    satisfaccion: 50,
    dinero: 0,
    clientes_resueltos: 0,
    clientes_irados: 0,
    nivel: 1,
    experiencia: 0,
  });

  const [escenaActual, setEscenaActual] = useState(1);

  const manejarDecision = (decision: number) => {
    const nuevasEstado = { ...estado };
    
    if (decision === 1) {
      nuevasEstado.satisfaccion += 20;
      nuevasEstado.dinero += 50;
      nuevasEstado.clientes_resueltos += 1;
    } else if (decision === 2) {
      nuevasEstado.satisfaccion += 10;
      nuevasEstado.dinero += 20;
      nuevasEstado.clientes_resueltos += 1;
    } else if (decision === 3) {
      nuevasEstado.satisfaccion += 30;
      nuevasEstado.dinero -= 100;
      nuevasEstado.clientes_resueltos += 1;
    } else if (decision === 4) {
      nuevasEstado.satisfaccion -= 10;
      nuevasEstado.dinero -= 50;
      nuevasEstado.clientes_irados += 1;
    }
    
    setEstado(nuevasEstado);
    setEscenaActual((escenaActual % 3) + 1);
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="card-interactive p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Atención al Cliente Premium</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Simulador de resolución de quejas y mantenimiento de relaciones
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-2">Satisfacción</h3>
            <p className="text-3xl font-bold text-[var(--color-text-accent)]">{estado.satisfaccion}%</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Nivel {estado.nivel}</p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-2">Recursos</h3>
            <p className="text-3xl font-bold text-[var(--color-text-accent)]">${estado.dinero}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Clientes resueltos: {estado.clientes_resueltos}</p>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h3 className="font-semibold text-white mb-4">Escena {escenaActual}</h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            "Llega una queja compleja de un cliente premium que ha gastado $5,000 en el último mes. Está molesto porque su pedido se retrasó dos semanas."
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => manejarDecision(1)}
              className="btn-primary w-full"
            >
              [1] Atender rápido y ceder ofertas especiales
            </button>
            <button
              onClick={() => manejarDecision(2)}
              className="btn-secondary w-full mt-2"
            >
              [2] Investigar a profundidad las causas
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => manejarDecision(3)}
              className="btn-primary w-full mt-2"
            >
              [3] Ofrecer reembolso automático del 20%
            </button>
            <button
              onClick={() => manejarDecision(4)}
              className="btn-secondary w-full mt-2"
            >
              [4] Involucrar a gerentes senior
            </button>
          </div>
        </div>

        {escenaActual > 3 && (
          <div className="mt-8 p-6 card-interactive">
            <h3 className="font-semibold text-white mb-4">Resultado</h3>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Has tomado tu decisión. Los resultados se reflejan en tus métricas arriba.
            </p>
            <p className="text-sm">
              💡 <strong>Consejo:</strong> La clave en atención al cliente es equilibrar satisfacción del cliente con rentabilidad del negocio.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}