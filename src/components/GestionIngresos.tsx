"use client";
import { useState, useEffect } from "react";
import { RegistroIngreso } from "./RegistroIngreso";
import { TablaIngresos } from "./TablaIngresos"; // Esta debe ser tu tabla que muestra filas
import { obtenerIngresosPorRango } from "@/services/ingresosService";

export function GestionIngresos() {
  const [refresh, setRefresh] = useState(0);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [ingresosAnuales, setIngresosAnuales] = useState<any[]>([]);

  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const cargarDatos = async () => {
    const data = await obtenerIngresosPorRango(fechaInicio, fechaFin);
    setIngresos(data);

    const year = new Date().getFullYear();
    const dataAnual = await obtenerIngresosPorRango(`${year}-01-01`, `${year}-12-31`);
    setIngresosAnuales(dataAnual);
  };

  useEffect(() => { cargarDatos(); }, [refresh, fechaInicio, fechaFin]);

  const totalPeriodo = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
  const totalAnual = ingresosAnuales.reduce((sum, i) => sum + parseFloat(i.monto), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Filtros */}
      <div className="flex gap-4 bg-white p-6 rounded-3xl border shadow-sm no-print">
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="p-2 border rounded-xl" />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="p-2 border rounded-xl" />
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 rounded-xl font-black">PDF / IMPRIMIR</button>
      </div>

      {/* Tarjetas de Totales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <RegistroIngreso onExito={() => setRefresh(prev => prev + 1)} />
        <div className="space-y-4">
          <div className="bg-emerald-900 p-8 rounded-3xl text-white">
            <p className="text-emerald-400 text-[10px] font-black uppercase">Total Ingresos Periodo</p>
            <h2 className="text-4xl font-black">Bs {totalPeriodo.toFixed(2)}</h2>
          </div>
          <div className="bg-white border p-8 rounded-3xl">
            <p className="text-slate-400 text-[10px] font-black uppercase">Total Ingresos Anual</p>
            <h2 className="text-4xl font-black text-slate-800">Bs {totalAnual.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Área de Impresión */}
      <div className="printable-area">
        <div className="hidden print:block mb-8 text-center">
            <h1 className="text-4xl font-black uppercase">Informe de Ingresos</h1>
            <p className="text-slate-500 font-bold">Periodo: {fechaInicio} al {fechaFin}</p>
        </div>
        <TablaIngresos ingresos={ingresos} />
      </div>
    </div>
  );
}