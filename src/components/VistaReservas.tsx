"use client";
import { useState, useEffect } from "react";
import { registrarReservaConAdelanto } from "@/services/reservaService";
import { supabase } from "@/lib/supabase";

export function VistaReservas() {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [todasLasReservas, setTodasLasReservas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    huesped_nombre: "",
    huesped_telefono: "",
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: "",
    hora_llegada: "14:00",
    id_habitacion: "",
    nro_habitacion: "",
    monto_adelanto: 0,
    tipo_pago: "efectivo"
  });

  const cargarDatos = async () => {
    const { data: habs } = await supabase.from('habitaciones').select('*').order('numero');
    setHabitaciones(habs || []);
    const { data: res } = await supabase.from('reservas').select('*, habitaciones(id, numero)').neq('estado', 'cancelada');
    setTodasLasReservas(res || []);
  };

  useEffect(() => { cargarDatos(); }, []);

  const getEstadoHabitacion = (habId: string) => {
    const reserva = todasLasReservas.find(r => 
      r.id_habitacion === habId && 
      formData.fecha_inicio >= r.fecha_inicio && 
      formData.fecha_inicio <= r.fecha_fin
    );
    if (!reserva) return { color: 'bg-green-500' };
    return { color: 'bg-red-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_habitacion) { alert("Por favor, selecciona una habitación."); return; }

    // Validación de conflictos
    const { data: conflicto } = await supabase
      .from('reservas')
      .select('id')
      .eq('id_habitacion', formData.id_habitacion)
      .neq('estado', 'cancelada')
      .or(`and(fecha_inicio.lte.${formData.fecha_fin},fecha_fin.gte.${formData.fecha_inicio})`);

    if (conflicto && conflicto.length > 0) {
      alert("¡CONFLICTO! Esta habitación ya está reservada en esas fechas.");
      return;
    }

    try {
      await registrarReservaConAdelanto(formData, formData.monto_adelanto, formData.tipo_pago);
      alert("Reserva registrada con éxito.");
      setFormData({ 
        huesped_nombre: "", huesped_telefono: "", fecha_inicio: new Date().toISOString().split('T')[0], 
        fecha_fin: "", hora_llegada: "14:00", id_habitacion: "", nro_habitacion: "", 
        monto_adelanto: 0, tipo_pago: "efectivo" 
      });
      cargarDatos();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-black text-blue-900 uppercase">Sistema de Reservas</h2>

      {/* MAPA DE HABITACIONES */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <label className="block text-sm font-bold text-slate-400 mb-4">SELECCIONA HABITACIÓN</label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {habitaciones.map((h) => {
            const estado = getEstadoHabitacion(h.id);
            const isSelected = formData.id_habitacion === h.id;
            return (
              <button 
                key={h.id} 
                type="button"
                onClick={() => setFormData({...formData, id_habitacion: h.id, nro_habitacion: String(h.numero)})}
                className={`${estado.color} p-4 text-white rounded-xl font-bold transition-all ${isSelected ? 'ring-4 ring-blue-900 scale-110 shadow-xl' : 'hover:scale-105'}`}
              >
                Hab. {h.numero}
              </button>
            );
          })}
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
        <input className="w-full p-3 border rounded-xl" placeholder="Nombre del Huésped" required value={formData.huesped_nombre} onChange={(e) => setFormData({...formData, huesped_nombre: e.target.value})} />
        <input className="w-full p-3 border rounded-xl" placeholder="Teléfono" required value={formData.huesped_telefono} onChange={(e) => setFormData({...formData, huesped_telefono: e.target.value})} />
        
        <div className="grid grid-cols-2 gap-4">
          <input type="date" className="p-3 border rounded-xl" required value={formData.fecha_inicio} onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})} />
          <input type="date" className="p-3 border rounded-xl" required value={formData.fecha_fin} onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})} />
        </div>

        <select className="w-full p-3 border rounded-xl" value={formData.tipo_pago} onChange={(e) => setFormData({...formData, tipo_pago: e.target.value})}>
          <option value="efectivo">Pago en Efectivo</option>
          <option value="qr">Pago con QR</option>
        </select>
        
        <input type="number" className="w-full p-3 border rounded-xl" placeholder="Adelanto (Bs.)" value={formData.monto_adelanto} onChange={(e) => setFormData({...formData, monto_adelanto: parseFloat(e.target.value) || 0})} />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase hover:bg-blue-700">Confirmar Reserva</button>
      </form>
    </div>
  );
}