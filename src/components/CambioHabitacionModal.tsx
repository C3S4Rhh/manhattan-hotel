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

  const ejecutarCambio = async () => {
    if (!nuevaHabitacionId) return alert("Selecciona una habitación");
    setCargando(true);

    try {
      // 1. Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Mover hospedaje
      await supabase
        .from("hospedajes")
        .update({ id_habitacion: nuevaHabitacionId })
        .eq("id", registro.id);

      // 3. Registrar auditoría (con usuario_id)
      await supabase.from("cambios_habitacion").insert([
        {
          hospedaje_id: registro.id,
          habitacion_anterior_id: hab.id,
          habitacion_nueva_id: nuevaHabitacionId,
          usuario_id: user?.id,
         observaciones: observaciones
        },
      ]);

      // 4. Actualizar habitaciones
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
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-black mb-4">Cambiar Hab. #{hab.numero}</h2>

        <select
          className="w-full p-4 bg-slate-50 rounded-xl font-bold mb-6"
          onChange={(e) => setNuevaHabitacionId(e.target.value)}
        >
          <option value="">-- Elegir nueva habitación --</option>
          {habitacionesLibres.map((h) => (
            <option key={h.id} value={h.id}>
              Hab. #{h.numero} - {h.tipo}
            </option>
          ))}
        </select>
        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block mt-4">
          Motivo del cambio
        </label>
        <textarea
          className="w-full p-4 bg-slate-50 rounded-xl font-bold mb-6 text-sm"
          placeholder="Escribe la razón del cambio..."
          rows={2}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-slate-400 font-bold text-xs uppercase"
          >
            Cancelar
          </button>
          <button
            onClick={ejecutarCambio}
            disabled={cargando}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase"
          >
            {cargando ? "Procesando..." : "Confirmar Cambio"}
          </button>
        </div>
      </div>
    </div>
  );
}
