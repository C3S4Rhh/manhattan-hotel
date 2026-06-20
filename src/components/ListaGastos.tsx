"use client";
import { useEffect, useState } from "react";
import { obtenerGastosDelMes } from "@/services/gastosService";

export function ListaGastos({ refreshTrigger }: { refreshTrigger: number }) {
  const [gastos, setGastos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function load() {
      setCargando(true);
      try {
        const data = await obtenerGastosDelMes();
        setGastos(data || []);
      } catch (error) {
        console.error("Error al cargar gastos:", error);
      } finally {
        setCargando(false);
      }
    }
    load();
  }, [refreshTrigger]);

  const totalMensual = gastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);

  return (
    <div className="space-y-4 mt-6">
      {/* Tarjeta de Total */}
      <div className="bg-slate-800 p-6 rounded-2xl text-white flex justify-between items-center shadow-lg">
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Egresos Mes</p>
          <p className="text-3xl font-black">{totalMensual.toFixed(2)} Bs.</p>
        </div>
        <div className="bg-rose-500/20 p-3 rounded-xl">
          <span className="text-xl">📉</span>
        </div>
      </div>

      {/* Lista de Gastos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-slate-400 font-bold text-sm">Cargando datos...</div>
        ) : gastos.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold text-sm">No hay registros este mes</div>
        ) : (
          gastos.map((gasto) => (
            <div 
              key={gasto.id} 
              className="p-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-black text-slate-800">{gasto.descripcion}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {gasto.categoria} • {gasto.tipo_pago}
                </p>
              </div>
              <p className="font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg text-sm">
                {parseFloat(gasto.monto).toFixed(2)} Bs.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}