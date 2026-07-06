"use client";
import { useState } from "react";
// Importa tus componentes de Registro y Lista que ya tienes creados
import { FormularioReserva } from "./FormularioReserva";
import { ListaReservas } from "./ListaReservas";

export function VistaReservas() {
  const [subVista, setSubVista] = useState<"menu" | "registrar" | "lista">(
    "menu",
  );

  if (subVista === "registrar")
    return <FormularioReserva onBack={() => setSubVista("menu")} />;
  if (subVista === "lista")
    return <ListaReservas onBack={() => setSubVista("menu")} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
          Gestión de Reservas
        </h2>
        <p className="text-slate-400 font-bold text-sm">
          Control total sobre tus reservas confirmadas y futuras
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Opción: Registrar */}
        <button
          onClick={() => setSubVista("registrar")}
          className="p-10 bg-white rounded-3xl border border-blue-100 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all text-left"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-3xl">
            ➕
          </div>
          <h3 className="font-black text-xl text-slate-800 uppercase">
            Registrar Nueva
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Crea una reserva, asigna habitación y registra el adelanto en caja.
          </p>
        </button>

        {/* Opción: Ver Lista */}
        <button
          onClick={() => setSubVista("lista")}
          className="p-10 bg-white rounded-3xl border border-violet-100 shadow-sm hover:shadow-2xl hover:border-violet-300 transition-all text-left"
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 text-3xl">
            📋
          </div>
          <h3 className="font-black text-xl text-slate-800 uppercase">
            Reservas Hechas
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Consulta el estado, fechas y montos de todas las reservas
            registradas.
          </p>
        </button>
      </div>
    </div>
  );
}
