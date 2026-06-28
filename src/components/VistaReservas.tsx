"use client";
import { useState, useEffect } from "react";
import { registrarReservaConAdelanto } from "@/services/reservaService";
import { supabase } from "@/lib/supabase";

export function VistaReservas() {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [reservasHoy, setReservasHoy] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    huesped_nombre: "",
    huesped_telefono: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_llegada: "14:00",
    id_habitacion: "",
    monto_adelanto: 0
  });

  const cargarDatos = async () => {
    // Cargar habitaciones
    const { data: habs } = await supabase.from('habitaciones').select('*').order('numero');
    setHabitaciones(habs || []);

    // Cargar reservas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const { data: res } = await supabase
      .from('reservas')
      .select('*, habitaciones(numero)')
      .eq('fecha_inicio', hoy)
      .neq('estado', 'cancelada');
    setReservasHoy(res || []);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_habitacion || !formData.fecha_inicio || !formData.fecha_fin) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    // 1. Verificar conflicto de fechas
    const { data: conflicto, error: errorConflicto } = await supabase
      .from('reservas')
      .select('*')
      .eq('id_habitacion', formData.id_habitacion)
      .neq('estado', 'cancelada')
      .or(`fecha_inicio.lte.${formData.fecha_fin},and(fecha_fin.gte.${formData.fecha_inicio})`);

    if (conflicto && conflicto.length > 0) {
      alert("¡CONFLICTO! Esta habitación ya tiene una reserva en esas fechas.");
      return;
    }

    // 2. Registrar
    try {
      await registrarReservaConAdelanto(formData, formData.monto_adelanto);
      alert("Reserva confirmada correctamente.");
      setFormData({ huesped_nombre: "", huesped_telefono: "", fecha_inicio: "", fecha_fin: "", hora_llegada: "14:00", id_habitacion: "", monto_adelanto: 0 });
      cargarDatos(); 
    } catch (error) {
      alert("Error al registrar");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Sistema de Reservas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PANEL IZQUIERDO: SELECCIÓN */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4">Habitaciones</h3>
          <select 
            className="w-full p-4 border rounded-xl font-bold bg-slate-50"
            value={formData.id_habitacion}
            onChange={(e) => setFormData({...formData, id_habitacion: e.target.value})}
          >
            <option value="">Seleccione una habitación...</option>
            {habitaciones.map((h) => (
              <option key={h.id} value={h.id}>Hab. {h.numero} - {h.tipo}</option>
            ))}
          </select>
        </div>

        {/* PANEL DERECHO: FORMULARIO */}
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full p-3 border rounded-xl" placeholder="Nombre del Huésped" required onChange={(e) => setFormData({...formData, huesped_nombre: e.target.value})} value={formData.huesped_nombre} />
            <input className="w-full p-3 border rounded-xl" placeholder="Teléfono" required onChange={(e) => setFormData({...formData, huesped_telefono: e.target.value})} value={formData.huesped_telefono} />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="p-3 border rounded-xl" required onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})} value={formData.fecha_inicio} />
              <input type="date" className="p-3 border rounded-xl" required onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})} value={formData.fecha_fin} />
            </div>
            <input type="number" className="w-full p-3 border rounded-xl" placeholder="Adelanto (Bs.)" onChange={(e) => setFormData({...formData, monto_adelanto: parseFloat(e.target.value) || 0})} value={formData.monto_adelanto} />
            <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase hover:bg-blue-700">Confirmar Reserva</button>
          </form>
        </div>
      </div>

      {/* PANEL DE CONTROL: RESERVAS DE HOY */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4">Reservas confirmadas para hoy</h3>
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase text-slate-400">
            <tr>
              <th className="p-4">Huésped</th>
              <th className="p-4">Habitación</th>
              <th className="p-4">Hora</th>
              <th className="p-4">Contacto</th>
            </tr>
          </thead>
          <tbody>
            {reservasHoy.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-4 font-bold">{r.huesped_nombre}</td>
                <td className="p-4 font-black">Hab. {r.habitaciones?.numero}</td>
                <td className="p-4 font-bold">{r.hora_llegada}</td>
                <td className="p-4 font-bold text-blue-600">{r.huesped_telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}