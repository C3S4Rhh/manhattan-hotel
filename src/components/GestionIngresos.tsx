"use client";
import { useState, useEffect } from "react";
import { RegistroIngreso } from "./RegistroIngreso";
import { TablaIngresos } from "./TablaIngresos";
import { obtenerIngresosPorRango } from "@/services/ingresosService";

export function GestionIngresos() {
  const [refresh, setRefresh] = useState(0);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [ingresosAnuales, setIngresosAnuales] = useState<any[]>([]);

  // Estados de fechas para rango manual (igual que en Egresos)
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0]
  );

  const cargarDatos = async () => {
    // Cargar datos filtrados por el rango de fechas
    const dataFiltrada = await obtenerIngresosPorRango(fechaInicio, fechaFin);
    setIngresos(dataFiltrada);

    // Cargar datos anuales para el resumen
    const year = new Date().getFullYear();
    const dataAnual = await obtenerIngresosPorRango(
      `${year}-01-01`,
      `${year}-12-31`
    );
    setIngresosAnuales(dataAnual);
  };

  useEffect(() => {
    cargarDatos();
  }, [refresh, fechaInicio, fechaFin]);

  const totalPeriodo = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
  const totalAnual = ingresosAnuales.reduce((sum, i) => sum + parseFloat(i.monto), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="no-print">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
            Control de Ingresos
          </h2>
          <p className="text-slate-400 font-bold">Gestión de ingresos extraordinarios.</p>
        </header>

        {/* Panel de Filtros e Impresión */}
        <div className="flex flex-wrap gap-4 items-end bg-white p-6 rounded-3xl border border-slate-100 shadow-sm no-print">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border rounded-xl"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black text-sm uppercase hover:bg-emerald-700"
          >
            PDF / Imprimir
          </button>
        </div>

        {/* Registro y Totales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
          <RegistroIngreso onExito={() => setRefresh((prev) => prev + 1)} />
          <div className="space-y-4">
            <div className="bg-emerald-900 p-8 rounded-3xl text-white">
              <p className="text-emerald-400 text-[10px] font-black uppercase">Total Ingresos Extra Mensual</p>
              <h2 className="text-4xl font-black">Bs {totalPeriodo.toFixed(2)}</h2>
            </div>
            <div className="bg-white border p-8 rounded-3xl">
              <p className="text-slate-400 text-[10px] font-black uppercase">Total Ingresos Extra Anual</p>
              <h2 className="text-4xl font-black text-slate-800">Bs {totalAnual.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        {/* Área de Impresión */}
        <div className="printable-area">
          <div className="hidden print:block mb-8 text-center">
            <h1 className="text-4xl font-black text-slate-900 uppercase">Informe de Ingresos</h1>
            <p className="text-slate-500 font-bold">Periodo: {fechaInicio} al {fechaFin}</p>
          </div>
          <TablaIngresos ingresos={ingresos} />
          
          <div className="hidden print:block mb-8 text-center">
            <div className="flex justify-end">
              <div className="mt-4 p-4 bg-slate-100 rounded-2xl border border-slate-200">
                <p className="text-xs font-black uppercase text-slate-500">TOTAL INGRESOS</p>
                <h2 className="text-2xl font-black text-slate-900">
                  {totalPeriodo.toLocaleString("es-BO", { style: "currency", currency: "BOB" })}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}