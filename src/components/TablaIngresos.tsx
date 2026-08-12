"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function TablaIngresos({ 
  ingresos, 
  usuarioActual, 
  onEliminado 
}: { 
  ingresos: any[]; 
  usuarioActual: any; 
  onEliminado?: () => void; 
}) {
  const [cargandoId, setCargandoId] = useState<string | null>(null);

  const eliminarIngreso = async (id: string) => {
    if (usuarioActual?.rol !== 'administrador') {
      return alert("Solo los administradores pueden eliminar registros.");
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este ingreso extra?")) {
      return;
    }

    setCargandoId(id);

    const { error } = await supabase
      .from('ingresos_extra') // Ajusta el nombre de la tabla si es distinto en tu base de datos
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error al eliminar el ingreso:", error);
      alert("No se pudo eliminar el ingreso.");
    } else {
      if (onEliminado) {
        onEliminado();
      }
    }
    setCargandoId(null);
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b uppercase text-[10px] text-slate-400">
          <th className="p-4">Fecha</th>
          <th className="p-4">Descripción</th>
          <th className="p-4">Categoría</th>
          <th className="p-4">Pago</th>
          <th className="p-4 text-right">Monto</th>
          {usuarioActual?.rol === 'administrador' && <th className="p-4 text-center">Acción</th>}
        </tr>
      </thead>
      <tbody>
        {ingresos.map((i) => (
          <tr key={i.id} className="border-b hover:bg-slate-50">
            <td className="p-4 font-bold text-slate-600">{new Date(i.fecha).toLocaleDateString()}</td>
            <td className="p-4 font-black text-slate-800">{i.descripcion}</td>
            <td className="p-4 uppercase text-xs text-slate-600">{i.categoria}</td>
            <td className="p-4 uppercase text-xs text-slate-600">{i.tipo_pago}</td>
            <td className="p-4 text-right font-black text-emerald-600">+{parseFloat(i.monto).toFixed(2)} Bs.</td>
            {usuarioActual?.rol === 'administrador' && (
              <td className="p-4 text-center">
                <button 
                  onClick={() => eliminarIngreso(i.id)}
                  disabled={cargandoId === i.id}
                  className="text-rose-400 hover:text-rose-600 font-bold text-[10px] uppercase transition-colors disabled:opacity-50"
                >
                  {cargandoId === i.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
