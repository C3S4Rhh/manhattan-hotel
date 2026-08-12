"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function TablaGastos({ 
  gastos, 
  usuarioActual, 
  onEliminado 
}: { 
  gastos: any[]; 
  usuarioActual?: any; 
  onEliminado?: () => void; 
}) {
  const [cargandoId, setCargandoId] = useState<string | null>(null);
  const esAdmin = usuarioActual?.rol === 'administrador';

  const eliminarGasto = async (id: string) => {
    if (!esAdmin) {
      return alert("Solo los administradores pueden eliminar registros.");
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      return;
    }

    setCargandoId(id);
    const { error } = await supabase
      .from('gastos') 
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error al eliminar el gasto:", error);
      alert("No se pudo eliminar el registro.");
    } else {
      if (onEliminado) onEliminado();
    }
    setCargandoId(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Fecha</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Responsable</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Descripción</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Categoría</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Pago</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase text-right">Monto</th>
            {esAdmin && <th className="p-4 font-black text-slate-400 text-[10px] uppercase text-center no-print">Acción</th>}
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-600">
                {new Date(g.fecha || g.created_at).toLocaleDateString()}
              </td>
              <td className="p-4 text-xs font-bold text-slate-500 uppercase">{g.responsable || 'admin'}</td>
              <td className="p-4 text-sm font-black text-slate-800">{g.descripcion}</td>
              <td className="p-4 text-xs font-bold text-slate-500 uppercase">{g.categoria}</td>
              <td className="p-4 text-xs font-bold text-slate-500 uppercase">{g.tipo_pago}</td>
              <td className="p-4 text-sm font-black text-rose-600 text-right">
                {parseFloat(g.monto).toFixed(2)} Bs.
              </td>
              {esAdmin && (
                <td className="p-4 text-center no-print">
                  <button
                    onClick={() => eliminarGasto(g.id)}
                    disabled={cargandoId === g.id}
                    className="text-rose-400 hover:text-rose-600 font-bold text-[10px] uppercase transition-colors disabled:opacity-50"
                  >
                    {cargandoId === g.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
