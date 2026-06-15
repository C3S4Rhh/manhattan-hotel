'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function HistorialCambios() {
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      const { data } = await supabase.from('vista_historial_cambios').select('*');
      setHistorial(data || []);
    };
    fetchHistorial();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
      <h2 className="text-lg font-black mb-4 uppercase tracking-widest">Auditoría de Cambios</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px] uppercase font-bold text-slate-500">
          <thead>
            <tr className="border-b">
              <th className="p-3">Fecha</th>
              <th className="p-3">De</th>
              <th className="p-3">A</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Observación</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((c) => (
              <tr key={c.id} className="border-b hover:bg-slate-50">
                <td className="p-3 text-slate-800">{new Date(c.fecha_cambio).toLocaleDateString()}</td>
                <td className="p-3 text-rose-600 font-black">HAB #{c.anterior_numero}</td>
                <td className="p-3 text-emerald-600 font-black">HAB #{c.nueva_numero}</td>
                <td className="p-3 italic">{c.usuario_email}</td>
                <td className="p-3 text-slate-600 normal-case font-medium max-w-[200px] truncate">
                  {c.observaciones || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}