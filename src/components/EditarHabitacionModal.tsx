'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const CONFIG_ESTADOS: Record<string, { border: string, bg: string, text: string, label: string, shadow: string }> = {
    'reserva': { border: 'border-violet-500', bg: 'bg-violet-50', text: 'text-violet-600', label: 'Reserva', shadow: 'shadow-violet-100/50' },
    'ingreso': { border: 'border-sky-500', bg: 'bg-sky-50', text: 'text-sky-600', label: 'Ingreso', shadow: 'shadow-sky-100/50' },
    'permanente': { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Permanente', shadow: 'shadow-emerald-100/50' },
    'sucio': { border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-500', label: 'Sucio', shadow: 'shadow-rose-100/50' },
    'alquiler': { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', label: 'Alquiler', shadow: 'shadow-orange-100/50' },
    'admin': { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', label: 'Admin', shadow: 'shadow-orange-100/50' },
    'o': { border: 'border-green-700', bg: 'bg-green-200', text: 'text-rose-500', label: 'Ocupada', shadow: 'shadow-green-100/50' },
    'L': { border: 'border-emerald-500', bg: 'bg-white', text: 'text-emerald-600', label: 'Libre', shadow: 'shadow-emerald-100/50' }
};

const CONFIG_LIMPIEZA: Record<string, string> = {
  'lo': 'L.O.',
  'sucio': 'Sucio',
  's-12': 'S-12',
  'limpio': 'Limpio',
   'sl': 'S.L'
};

export default function EditarHabitacionModal({ habitacion, onClose, onUpdate, rol }: any) {
  const [nuevoPrecio, setNuevoPrecio] = useState(habitacion.precio_base);
  const [nuevoTipo, setNuevoTipo] = useState(habitacion.tipo);
  const [nuevoEstado, setNuevoEstado] = useState(habitacion.estado_actual?.toLowerCase() || 'L');
  const [nuevoLimpieza, setNuevoLimpieza] = useState(habitacion.estado_limpieza?.toLowerCase() || 'limpio');
  const [cargando, setCargando] = useState(false);
  const [observacion, setObservacion] = useState(habitacion.observaciones || '');

  const esServicio = rol === 'servicio';

  const guardarCambios = async () => {
    setCargando(true);
    // Si es servicio, solo actualizamos limpieza y observaciones
    const updates = esServicio 
      ? { estado_limpieza: nuevoLimpieza, observaciones: observacion }
      : { precio_base: Number(nuevoPrecio), tipo: nuevoTipo, estado_actual: nuevoEstado, estado_limpieza: nuevoLimpieza, observaciones: observacion };

    const { error } = await supabase
      .from('habitaciones')
      .update(updates)
      .eq('id', habitacion.id);

    if (!error) {
      onUpdate();
      onClose();
    } else {
      alert("Error al actualizar la habitación");
    }
    setCargando(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-black text-slate-800 mb-1 uppercase tracking-tighter">Habitación #{habitacion.numero}</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase mb-6 tracking-widest">
            {esServicio ? 'Control de limpieza y observaciones' : 'Ajuste de estado, limpieza y tarifas'}
        </p>
        
        <div className="space-y-6">
          {/* ESTADO DE OCUPACIÓN - SOLO ADMIN */}
          {!esServicio && (
            <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">Estado de Ocupación</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(CONFIG_ESTADOS).map(([key, valor]) => (
                    <button key={key} type="button" onClick={() => setNuevoEstado(key)}
                    className={`p-3 rounded-2xl border-2 transition-all ${nuevoEstado === key ? `${valor.border} ${valor.bg} scale-105` : 'border-slate-50 bg-slate-50'}`}>
                    <span className={`text-[9px] font-black uppercase ${nuevoEstado === key ? valor.text : 'text-slate-400'}`}>{valor.label}</span>
                    </button>
                ))}
                </div>
            </div>
          )}

          {/* ESTADO DE LIMPIEZA - PARA TODOS */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">Estado de Limpieza</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(CONFIG_LIMPIEZA).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setNuevoLimpieza(key)}
                  className={`p-3 rounded-2xl border-2 transition-all ${nuevoLimpieza === key ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                  <span className="text-[9px] font-black uppercase">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PRECIO Y TIPO - SOLO ADMIN */}
          {!esServicio && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Tipo de Habitación</label>
                <input type="text" value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} className="w-full bg-slate-50 border-2 rounded-2xl p-4 font-bold outline-none" />
                </div>
                <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Precio (Bs.)</label>
                <input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} className="w-full bg-slate-50 border-2 rounded-2xl p-4 font-black text-xl outline-none" />
                </div>
            </div>
          )}

          {/* OBSERVACIONES - PARA TODOS */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Observaciones / Notas</label>
            <textarea 
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-medium text-slate-700 outline-none focus:border-indigo-500 h-24"
                placeholder="Ej: Requiere mantenimiento en la ducha..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cancelar</button>
            <button onClick={guardarCambios} disabled={cargando} className="flex-1 bg-slate-900 p-4 rounded-2xl font-black text-white uppercase text-[10px] tracking-widest shadow-xl">
              {cargando ? 'Guardando...' : 'Confirmar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}