"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function ListaReservas({ onBack }: { onBack: () => void }) {
  const [reservas, setReservas] = useState<any[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [cargando, setCargando] = useState(false);

  const cargarReservas = async (fecha: string) => {
    setCargando(true);
    // Filtramos las reservas donde la fecha esté en el rango de inicio y fin
    const { data, error } = await supabase
      .from("reservas")
      .select("*, habitaciones(numero)")
      .lte("fecha_inicio", fecha)
      .gte("fecha_fin", fecha)
      .neq("estado", "cancelada");

    if (!error) setReservas(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarReservas(fechaSeleccionada);
  }, [fechaSeleccionada]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm font-bold text-slate-400 hover:text-slate-800"
        >
          ← VOLVER
        </button>
        <h2 className="text-2xl font-black text-slate-800 uppercase">
          Reservas del Día
        </h2>
        <input
          type="date"
          className="p-3 border rounded-xl font-bold"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
      </div>

      {cargando ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reservas.length > 0 ? (
            // ... dentro del map de reservas
            reservas.map((r) => (
              <div
                key={r.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Encabezado con Habitación y Hora */}
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-50 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">
                    Hab. {r.habitaciones?.numero || "N/A"}
                  </span>
                  <span className="text-slate-400 font-black text-[10px] uppercase">
                    hora reserva: {r.hora_llegada}
                  </span>
                </div>

                {/* Datos del Huésped */}
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Huésped
                    </p>
                    <p className="font-black text-slate-800">
                      {r.huesped_nombre}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Celular
                    </p>
                    <p className="font-bold text-slate-600 text-sm">
                      {r.huesped_telefono || "No registrado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Encargado
                    </p>
                    <p className="font-bold text-slate-600 text-sm">
                      {/* Ahora mostraremos el nombre guardado directamente en la reserva */}
                      {r.nombre_encargado || "Sistema"}
                    </p>
                  </div>
                </div>

                {/* Pie con montos */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[18px] font-bold text-slate-400 uppercase">
                    Adelanto: {r.monto_adelanto} Bs.
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                      r.estado === "confirmada"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {r.estado}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-slate-400 font-bold">
              No hay reservas para esta fecha.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
