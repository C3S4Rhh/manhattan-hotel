"use client";
import { useEffect, useState } from "react";
import { obtenerIngresosDelMes } from "@/services/ingresosService";

export function ListaIngresos({ refreshTrigger }: { refreshTrigger: number }) {
  const [ingresos, setIngresos] = useState<any[]>([]);

  useEffect(() => {
    obtenerIngresosDelMes().then(setIngresos);
  }, [refreshTrigger]);

  const total = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);

  return (
    <div className="space-y-6">
      {/* Tarjeta de Total con estilo Premium */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-3xl text-white shadow-xl shadow-emerald-900/20">
        <p className="text-emerald-200 font-black text-[10px] uppercase tracking-widest mb-1">
          Total Ingresos Extra
        </p>
        <h2 className="text-4xl font-black tracking-tighter">
          {total.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
        </h2>
        <p className="text-emerald-300/80 text-xs font-bold mt-2">Mes actual</p>
      </div>

      {/* Lista estilizada */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {ingresos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">No hay ingresos registrados</div>
        ) : (
          ingresos.map((i) => (
            <div key={i.id} className="group flex justify-between items-center p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  {i.categoria.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{i.descripcion}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{i.categoria}</p>
                </div>
              </div>
              <p className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm">
                +{parseFloat(i.monto).toFixed(2)} Bs.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}