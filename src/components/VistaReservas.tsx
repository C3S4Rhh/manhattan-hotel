"use client";
import { useState, useEffect } from "react";
import { registrarReservaConAdelanto } from "@/services/reservaService";
import { supabase } from "@/lib/supabase";

export function VistaReservas() {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [todasLasReservas, setTodasLasReservas] = useState<any[]>([]);
  const [hospedajesActivos, setHospedajesActivos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    huesped_nombre: "", huesped_telefono: "", 
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: "", hora_llegada: "14:00", 
    id_habitacion: "", nro_habitacion: "", 
    monto_adelanto: 0, tipo_pago: "efectivo"
  });

  const cargarDatos = async () => {
    const { data: habs } = await supabase.from('habitaciones').select('*').order('numero');
    setHabitaciones(habs || []);
    const { data: res } = await supabase.from('reservas').select('*, habitaciones(id, numero)').neq('estado', 'cancelada');
    setTodasLasReservas(res || []);
    const { data: hosp } = await supabase.from('hospedajes').select('*, habitaciones(id, numero)').eq('estado', 'activo');
    setHospedajesActivos(hosp || []);
  };

  useEffect(() => { cargarDatos(); }, []);

  const getEstadoHabitacion = (hab: any) => {
    // Usamos la fecha seleccionada en el formulario para calcular el estado
    const fechaSeleccionada = new Date(formData.fecha_inicio + 'T00:00:00');

    // 1. ¿Está ocupada por un hospedaje activo en la fecha seleccionada?
    const hosp = hospedajesActivos.find(h => h.id_habitacion === hab.id);
    if (hosp) {
      const ingreso = new Date(hosp.fecha_ingreso);
      const salida = new Date(ingreso);
      salida.setDate(ingreso.getDate() + (hosp.cantidad_dias || 1));
      
      if (fechaSeleccionada >= ingreso && fechaSeleccionada < salida) 
        return { color: 'bg-red-500', label: `Ocupado: ${hosp.responsable || 'N/A'}` };
    }

    // 2. ¿Hay reserva futura en esa fecha?
    const reserva = todasLasReservas.find(r => 
        r.id_habitacion === hab.id && 
        fechaSeleccionada >= new Date(r.fecha_inicio + 'T00:00:00') && 
        fechaSeleccionada <= new Date(r.fecha_fin + 'T00:00:00')
    );
    if (reserva) return { color: 'bg-violet-500', label: 'Reservada' };

    // 3. Admin o Alquiler (Estado base)
    if (hab.estado_actual === 'admin' || hab.estado_actual === 'alquiler') return { color: 'bg-orange-500', label: hab.estado_actual };
    
    return { color: 'bg-green-500', label: 'Libre' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_habitacion) { alert("Selecciona una habitación"); return; }
    
    try {
      await registrarReservaConAdelanto(formData, formData.monto_adelanto, formData.tipo_pago);
      alert("Reserva registrada.");
      setFormData({...formData, huesped_nombre: "", id_habitacion: "", monto_adelanto: 0});
      cargarDatos();
    } catch (error: any) { alert("Error: " + error.message); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-black text-blue-900 uppercase">Sistema de Reservas</h2>

      {/* LEYENDA */}
      <div className="bg-slate-800 p-4 rounded-xl text-white grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-bold uppercase">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-violet-500 rounded"></div> Reservada</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div> Ocupada</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded"></div> Admin/Alq</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div> Libre</div>
      </div>

      {/* MAPA */}
      <div className="bg-white p-6 rounded-3xl border grid grid-cols-4 md:grid-cols-8 gap-3">
        {habitaciones.map((h) => {
          const estado = getEstadoHabitacion(h);
          return (
            <button key={h.id} type="button" onClick={() => setFormData({...formData, id_habitacion: h.id, nro_habitacion: String(h.numero)})}
              className={`${estado.color} p-3 text-white rounded-xl flex flex-col items-center transition-all ${formData.id_habitacion === h.id ? 'ring-4 ring-blue-900 scale-105' : 'hover:scale-105'}`}>
              <span className="font-black text-sm">#{h.numero}</span>
              <span className="text-[9px] opacity-90">{h.tipo}</span>
              <span className="text-[8px] bg-black/20 px-1 rounded mt-1 truncate w-full">{estado.label}</span>
            </button>
          );
        })}
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input className="p-3 border rounded-xl" placeholder="Huésped" required value={formData.huesped_nombre} onChange={(e) => setFormData({...formData, huesped_nombre: e.target.value})} />
          <input className="p-3 border rounded-xl" placeholder="Teléfono" required value={formData.huesped_telefono} onChange={(e) => setFormData({...formData, huesped_telefono: e.target.value})} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="date" className="p-3 border rounded-xl" required value={formData.fecha_inicio} onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})} />
          <input type="date" className="p-3 border rounded-xl" required value={formData.fecha_fin} onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})} />
          <input type="time" className="p-3 border rounded-xl" required value={formData.hora_llegada} onChange={(e) => setFormData({...formData, hora_llegada: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select className="p-3 border rounded-xl" onChange={(e) => setFormData({...formData, tipo_pago: e.target.value})}>
            <option value="efectivo">Pago Efectivo</option>
            <option value="qr">Pago QR</option>
          </select>
          <input type="number" className="p-3 border rounded-xl" placeholder="Adelanto Bs." onChange={(e) => setFormData({...formData, monto_adelanto: parseFloat(e.target.value) || 0})} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase">Confirmar Reserva</button>
      </form>

      {/* LISTADO DE REGISTRADOS */}
      <div className="bg-white p-6 rounded-3xl border">
        <h3 className="font-black text-slate-400 mb-4 uppercase text-xs">Reservas próximas</h3>
        <table className="w-full text-sm text-left">
          <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
                <th className="pb-3 text-left">huesped</th>
                <th className="pb-3 text-center">hab</th>
                <th className="pb-3 text-left">fecha ingreso</th>
                <th className="pb-3 text-left">fecha E.final</th>
                <th className="pb-3 text-left">hora de entrada</th>
                <th className="pb-3 text-left">Monto</th>
                <th className="pb-3 text-center">estado</th>
              </tr>
            </thead>
          <tbody>{todasLasReservas.map(r => (
            <tr key={r.id} className="border-t">
              <td className="p-3  text-left font-bold">{r.huesped_nombre}</td>
              <td className="p-3 text-center" >Hab. {r.habitaciones?.numero}</td>
              <td className="p-3 text-left">{r.fecha_inicio}</td>
              <td className="p-3 text-left">{r.fecha_fin}</td>
              <td className="p-3 text-left">{r.hora_llegada}</td>
              <td className="p-3 text-left">{r.monto_adelanto}</td>
              <td className="p-3 text-center text-blue-600">{r.estado}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}