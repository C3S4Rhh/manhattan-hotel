"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface HistorialItem {
  hospedaje_id: string;
  numero_habitacion: string;
  tipo_habitacion?: string;
  nombre_huesped: string;
  empresa?: string;
  nro_pax?: number;
  fecha_ingreso: string;
  hora_ingreso?: string;
  fecha_salida?: string;
  hora_salida?: string;
  estado: string; 
  precio_acordado: number;
  a_cuenta?: number;
  descuento_monto?: number;
  cantidad_dias?: number;
  observaciones?: string;
}

interface HistorialHospedajesProps {
  usuario?: {
    id: string;
    nombre: string;
    rol?: string; 
  };
}

export default function HistorialHospedajes({ usuario }: HistorialHospedajesProps) {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtroHabitacion, setFiltroHabitacion] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<'activo' | 'finalizado' | 'todos'>('activo'); 

  const [itemEditando, setItemEditando] = useState<HistorialItem | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esAdmin = usuario?.rol?.toLowerCase() === 'admin' || usuario?.rol?.toLowerCase() === 'administrador';

  useEffect(() => {
    cargarHistorial('activo');
  }, []);

  const cargarHistorial = async (estadoFiltro: 'activo' | 'finalizado' | 'todos' = filtroEstado, nroHab?: string) => {
    setCargando(true);
    let query = supabase
      .from('vista_historial_hospedajes')
      .select('*')
      .order('fecha_ingreso', { ascending: false });

    if (estadoFiltro !== 'todos') {
      query = query.eq('estado', estadoFiltro);
    }

    if (nroHab && nroHab.trim() !== '') {
      query = query.eq('numero_habitacion', nroHab.trim());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener el historial:', error);
    } else {
      setHistorial(data || []);
    }
    setCargando(false);
  };

  const handleFiltrarEstado = (nuevoEstado: 'activo' | 'finalizado' | 'todos') => {
    setFiltroEstado(nuevoEstado);
    cargarHistorial(nuevoEstado, filtroHabitacion);
  };

  const handleBuscarHabitacion = (e: React.FormEvent) => {
    e.preventDefault();
    cargarHistorial(filtroEstado, filtroHabitacion);
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemEditando) return;

    setGuardando(true);
    const { error } = await supabase
      .from('hospedajes') 
      .update({
        estado: itemEditando.estado, 
      })
      .eq('id', itemEditando.hospedaje_id);

    setGuardando(false);

    if (error) {
      alert('Error al actualizar el estado: ' + error.message);
    } else {
      alert('Estado actualizado correctamente');
      setItemEditando(null);
      cargarHistorial(filtroEstado, filtroHabitacion);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Historial de Hospedajes</h2>
          <p className="text-xs text-slate-500">Visualiza los registros de estancias y filtralos por estado.</p>
        </div>

        {/* Botones de selección de Estado */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => handleFiltrarEstado('activo')}
            className={`px-4 py-2 rounded-lg transition-all ${filtroEstado === 'activo' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Activos
          </button>
          <button
            onClick={() => handleFiltrarEstado('finalizado')}
            className={`px-4 py-2 rounded-lg transition-all ${filtroEstado === 'finalizado' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Finalizados
          </button>
          <button
            onClick={() => handleFiltrarEstado('todos')}
            className={`px-4 py-2 rounded-lg transition-all ${filtroEstado === 'todos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Ver Todos
          </button>
        </div>
      </div>

      {/* Barra de búsqueda rápida */}
      <form onSubmit={handleBuscarHabitacion} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Nro de Habitación (ej. 602)" 
          value={filtroHabitacion}
          onChange={(e) => setFiltroHabitacion(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-64"
        />
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Buscar Habitación
        </button>
        {filtroHabitacion && (
          <button 
            type="button"
            onClick={() => { setFiltroHabitacion(''); cargarHistorial(filtroEstado, ''); }}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Tabla de resultados */}
      {cargando ? (
        <div className="py-12 text-center text-slate-400 font-bold">Cargando registros...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b text-slate-600 uppercase text-[11px] font-black tracking-wider">
                <th className="p-3">Habitación</th>
                <th className="p-3">Huésped</th>
                <th className="p-3">Ingreso</th>
                <th className="p-3">Salida</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Precio</th>
                <th className="p-3">A Cuenta</th>
                {esAdmin && <th className="p-3 text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {historial.length > 0 ? (
                historial.map((item) => (
                  <tr key={item.hospedaje_id} className="border-b hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-700">{item.numero_habitacion}</td>
                    <td className="p-3 font-medium text-slate-900">{item.nombre_huesped}</td>
                    <td className="p-3 text-slate-600">{new Date(item.fecha_ingreso).toLocaleDateString()}</td>
                    <td className="p-3 text-slate-600">
                      {item.fecha_salida ? new Date(item.fecha_salida).toLocaleDateString() : <span className="text-emerald-600 font-bold">En curso</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.estado === 'finalizado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{item.precio_acordado}</td>
                    <td className="p-3 text-slate-600">{item.a_cuenta ?? 0}</td>
                    
                    {/* Botón de Editar Estado solo para Admin */}
                    {esAdmin && (
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setItemEditando(item)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Editar Estado
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={esAdmin ? 8 : 7} className="p-8 text-center text-slate-400 font-bold">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Editar Únicamente el Estado */}
      {itemEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Cambiar Estado (Hab. {itemEditando.numero_habitacion})
              </h3>
              <button 
                onClick={() => setItemEditando(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarEdicion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Huésped</label>
                <input 
                  type="text" 
                  disabled 
                  value={itemEditando.nombre_huesped} 
                  className="w-full bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nuevo Estado</label>
                <select
                  value={itemEditando.estado}
                  onChange={(e) => setItemEditando({ ...itemEditando, estado: e.target.value })}
                  className="w-full border border-slate-300 px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="activo">Activo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemEditando(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
