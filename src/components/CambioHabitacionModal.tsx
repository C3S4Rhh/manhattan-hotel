"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function CambioHabitacionModal({
  hab,
  registro,
  onClose,
  onSuccess,
}: any) {
  const [habitacionesLibres, setHabitacionesLibres] = useState<any[]>([]);
  const [nuevaHabitacionId, setNuevaHabitacionId] = useState("");
  const [cargando, setCargando] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  // Cálculo del acumulado previo real (incluyendo días extra si los hubiera)
  const calcularTotalActualPrevio = () => {
    const precioBase = Number(registro?.precio_acordado || 0);
    const totalDias = Number(registro?.cantidad_dias || 1);
    const precioPorDia = totalDias > 0 ? precioBase / totalDias : precioBase;
    
    const diasExtraActuales = Number(registro?.medios_dias_extra || 0);
    const subtotalConExtra = precioBase + (diasExtraActuales * precioPorDia);
    const descuento = Number(registro?.descuento_monto || 0);

    return Math.max(0, subtotalConExtra - descuento);
  };

  const montoPrevio = calcularTotalActualPrevio();

  // Inicializamos el input directamente con solo el monto acumulado previo
  const [nuevoTotalGlobal, setNuevoTotalGlobal] = useState<number>(montoPrevio);
  
  // Estado para permitir editar el precio de la nueva habitación si se requiere
  const [precioNuevaHabitacionEditable, setPrecioNuevaHabitacionEditable] = useState<number>(0);

  useEffect(() => {
    const fetchLibres = async () => {
      const { data } = await supabase
        .from("habitaciones")
        .select("*")
        .eq("estado_actual", "L");
      setHabitacionesLibres(data || []);
    };
    fetchLibres();
  }, []);

  const habitacionDestino = habitacionesLibres.find((h) => h.id === nuevaHabitacionId);

  // Al seleccionar la nueva habitación, colocamos el monto acumulado previo y asignamos su precio base
  useEffect(() => {
    if (habitacionDestino) {
      setNuevoTotalGlobal(montoPrevio);
      setPrecioNuevaHabitacionEditable(Number(habitacionDestino.precio_base || 0));
    }
  }, [nuevaHabitacionId, montoPrevio]);

  const ejecutarCambio = async () => {
    if (!nuevaHabitacionId) return alert("Selecciona una habitación");
    setCargando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Actualizamos el hospedaje con la nueva habitación y el precio acordado final
      await supabase
        .from("hospedajes")
        .update({ 
          id_habitacion: nuevaHabitacionId,
          precio_acordado: nuevoTotalGlobal 
        })
        .eq("id", registro.id);

      // 2. Registrar auditoría con el detalle del cambio y el precio editable de la nueva hab
      const detalleObs = `${observaciones} | Cambio de Hab. #${hab.numero} a Hab. #${habitacionDestino?.numero}. Monto Acumulado Asignado: Bs. ${nuevoTotalGlobal} (Precio nueva hab reg: Bs. ${precioNuevaHabitacionEditable})`;
      
      await supabase.from("cambios_habitacion").insert([
        {
          hospedaje_id: registro.id,
          habitacion_anterior_id: hab.id,
          habitacion_nueva_id: nuevaHabitacionId,
          usuario_id: user?.id,
          observaciones: detalleObs,
        },
      ]);

      // 3. Actualizar estados de las habitaciones
      await supabase
        .from("habitaciones")
        .update({ estado_actual: "L", estado_limpieza: "sucio" })
        .eq("id", hab.id);
      await supabase
        .from("habitaciones")
        .update({ estado_actual: "o", estado_limpieza: "limpio" })
        .eq("id", nuevaHabitacionId);

      onSuccess();
      onClose();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-4">
        <h2 className="text-xl font-black mb-2">Cambiar Hab. #{hab.numero}</h2>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
            Nueva Habitación Destino
          </label>
          <select
            className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm"
            value={nuevaHabitacionId}
            onChange={(e) => setNuevaHabitacionId(e.target.value)}
          >
            <option value="">-- Elegir nueva habitación --</option>
            {habitacionesLibres.map((h) => (
              <option key={h.id} value={h.id}>
                Hab. #{h.numero} - {h.tipo} (Bs. {h.precio_base})
              </option>
            ))}
          </select>
        </div>

        {/* Panel para controlar el monto acumulado y editar el precio de la nueva habitación */}
        {nuevaHabitacionId && (
          <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Control de Precios y Monto</p>
            
            <div>
              <label className="text-[9px] font-black uppercase text-slate-600 block mb-1">
                Precio de la nueva habitación (Editable)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2.5 bg-white border rounded-xl text-sm font-bold text-slate-700"
                value={precioNuevaHabitacionEditable}
                onChange={(e) => setPrecioNuevaHabitacionEditable(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-blue-600 block mb-1">
                Monto Acumulado (Editable)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-3 bg-white border-2 border-blue-500 rounded-xl text-base font-black text-blue-600"
                value={nuevoTotalGlobal}
                onChange={(e) => setNuevoTotalGlobal(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
            Motivo del cambio
          </label>
          <textarea
            className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm"
            placeholder="Ej. Se cambió de habitación..."
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-slate-400 font-bold text-xs uppercase hover:text-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={ejecutarCambio}
            disabled={cargando}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-700 transition-all"
          >
            {cargando ? "Procesando..." : "Confirmar Cambio"}
          </button>
        </div>
      </div>
    </div>
  );
}
