"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function MapaVisualReservas({ onBack }: { onBack: () => void }) {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [todasLasReservas, setTodasLasReservas] = useState<any[]>([]);
  const [hospedajesActivos, setHospedajesActivos] = useState<any[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [cargando, setCargando] = useState(false);

  // Estado para el modal de detalles
  const [reservaSeleccionada, setReservaSeleccionada] = useState<any | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    
    // Obtener todas las habitaciones
    const { data: habs } = await supabase
      .from("habitaciones")
      .select("*")
      .order("numero");
    setHabitaciones(habs || []);

    // Obtener reservas activas
    const { data: res } = await supabase
      .from("reservas")
      .select("*, habitaciones(id, numero)")
      .neq("estado", "cancelada");
    setTodasLasReservas(res || []);

    // Obtener hospedajes activos
    const { data: hosp } = await supabase
      .from("hospedajes")
      .select("*, habitaciones(id, numero)")
      .eq("estado", "activo");
    setHospedajesActivos(hosp || []);
    
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getReservaParaHabitacion = (habId: string) => {
    const fechaSel = new Date(fechaSeleccionada + "T00:00:00");
    return todasLasReservas.find(
      (r) =>
        r.id_habitacion === habId &&
        fechaSel >= new Date(r.fecha_inicio + "T00:00:00") &&
        fechaSel <= new Date(r.fecha_fin + "T00:00:00")
    );
  };

  const getEstadoHabitacion = (hab: any) => {
    const fechaSel = new Date(fechaSeleccionada + "T00:00:00");

    // 1. Estados especiales (Admin/Alquiler)
    if (hab.estado_actual === "admin" || hab.estado_actual === "alquiler")
      return {
        color: "bg-orange-500",
        label: hab.estado_actual.toUpperCase(),
        infoCliente: null,
      };

    // 2. Estado Ocupado (Hospedajes)
    const hosp = hospedajesActivos.find((h) => h.id_habitacion === hab.id);
    if (hosp) {
      const ingreso = new Date(hosp.fecha_ingreso);
      const salida = new Date(ingreso);
      salida.setDate(ingreso.getDate() + (hosp.cantidad_dias || 1));
      if (fechaSel >= ingreso && fechaSel < salida)
        return { 
            color: "bg-red-500", 
            label: "OCUPADO", 
            infoCliente: { nombre: hosp.huesped_nombre, hora: "Activo" }
        };
    }

    // 3. Estado Reservado
    const reserva = getReservaParaHabitacion(hab.id);
    if (reserva)
      return { 
        color: "bg-violet-500", 
        label: "RESERVADO", 
        infoCliente: { nombre: reserva.huesped_nombre, hora: reserva.hora_llegada } 
      };

    // 4. Libre
    return { color: "bg-green-500", label: "LIBRE", infoCliente: null };
  };

  const handleHabitacionClick = (hab: any) => {
    const reserva = getReservaParaHabitacion(hab.id);
    if (reserva) {
      setReservaSeleccionada(reserva);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm font-bold text-slate-400 hover:text-slate-800">
          ← VOLVER
        </button>
        <h2 className="text-2xl font-black text-slate-800 uppercase">Mapa de Habitaciones</h2>
        <input
          type="date"
          className="p-3 border rounded-xl font-bold"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
      </div>

      {/* Leyenda */}
      <div className="bg-slate-800 p-4 rounded-xl text-white grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-bold uppercase">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-violet-500 rounded"></div> Reservada</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div> Ocupada</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded"></div> Admin / Alq</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div> Libre</div>
      </div>

      {/* Grilla de Habitaciones */}
      <div className="bg-blue-100 p-6 rounded-3xl border border-blue-400 grid grid-cols-4 md:grid-cols-6 gap-3">
        {habitaciones.map((h) => {
          const estado = getEstadoHabitacion(h);
          const esReservada = estado.label === "RESERVADO";

          return (
            <div
              key={h.id}
              onClick={() => handleHabitacionClick(h)}
              className={`${estado.color} p-3 text-white rounded-xl flex flex-col items-center shadow-lg transition-transform ${
                esReservada ? "cursor-pointer hover:scale-105 hover:shadow-2xl ring-2 ring-white/50" : ""
              }`}
            >
              <span className="font-black text-sm">#{h.numero}</span>
              <span className="text-[8px] bg-black/20 px-1 rounded mt-1 mb-2 font-bold uppercase tracking-widest">
                {estado.label}
              </span>
              
              {/* Datos del Cliente si existen */}
              {estado.infoCliente && (
                <div className="text-[9px] text-center bg-white/10 w-full rounded-md p-1 mt-auto">
                    <p className="font-black truncate">{estado.infoCliente.nombre}</p>
                    <p className="font-normal opacity-80">{estado.infoCliente.hora}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL DE DATOS DE LA RESERVA */}
      {reservaSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="bg-violet-50 text-violet-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">
                  Habitación #{reservaSeleccionada.habitaciones?.numero || "N/A"}
                </span>
                <h3 className="text-xl font-black text-slate-800 uppercase mt-1">
                  Detalles de la Reserva
                </h3>
              </div>
              <button
                onClick={() => setReservaSeleccionada(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Huésped</p>
                  <p className="font-black text-slate-800 text-base">{reservaSeleccionada.huesped_nombre}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Celular / Teléfono</p>
                  <p className="font-bold text-slate-600">{reservaSeleccionada.huesped_telefono || "No registrado"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Fecha Inicio</p>
                  <p className="font-bold text-slate-700 text-sm">{reservaSeleccionada.fecha_inicio}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Fecha Fin</p>
                  <p className="font-bold text-slate-700 text-sm">{reservaSeleccionada.fecha_fin}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Hora de Llegada</p>
                  <p className="font-bold text-slate-700">{reservaSeleccionada.hora_llegada || "No especificada"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Encargado</p>
                  <p className="font-bold text-slate-700">{reservaSeleccionada.nombre_encargado || "Sistema"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">dia de registro</p>
                  <p className="font-bold text-slate-600 text-sm">
                    {reservaSeleccionada.created_at ? new Date(reservaSeleccionada.created_at).toLocaleString('es-BO', {
                      timeZone: 'America/La_Paz',
                      dateStyle: 'short',
                      timeStyle: 'medium'
                    }) : "-"}
                  </p> 
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-base font-bold text-slate-500 uppercase">
                  Adelanto: <strong className="text-slate-800">{reservaSeleccionada.monto_adelanto} Bs.</strong>
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  reservaSeleccionada.estado === "confirmada"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}>
                  {reservaSeleccionada.estado}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setReservaSeleccionada(null)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors uppercase text-xs tracking-wider"
              >
                Cerrar Ventana
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
