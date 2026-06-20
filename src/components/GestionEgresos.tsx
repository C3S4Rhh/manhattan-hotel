"use client";
import { useState, useEffect } from "react";
import { RegistroGasto } from "./RegistroGasto";
import { TotalGastos } from "./TotalGastos";
import { TablaGastos } from "./TablaGastos";
import { obtenerGastosPorRango } from "@/services/gastosService";

export function GestionEgresos() {
  const [refresh, setRefresh] = useState(0);
  const [gastos, setGastos] = useState<any[]>([]);
  const [gastosAnuales, setGastosAnuales] = useState<any[]>([]);

  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0],
  );

  const cargarDatos = async () => {
    const dataFiltrada = await obtenerGastosPorRango(fechaInicio, fechaFin);
    setGastos(dataFiltrada);

    const year = new Date().getFullYear();
    const dataAnual = await obtenerGastosPorRango(
      `${year}-01-01`,
      `${year}-12-31`,
    );
    setGastosAnuales(dataAnual);
  };

  useEffect(() => {
    cargarDatos();
  }, [refresh, fechaInicio, fechaFin]);

  const totalMes = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
  const totalAnual = gastosAnuales.reduce(
    (sum, g) => sum + parseFloat(g.monto),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="no-print">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
            Control de Egresos
          </h2>
          <p className="text-slate-400 font-bold">
            Gestión de gastos, nóminas y suministros.
          </p>
        </header>

        {/* Panel de Filtros e Impresión */}
        <div className="flex flex-wrap gap-4 items-end bg-white p-6 rounded-3xl border border-slate-100 shadow-sm no-print">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">
              Desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">
              Hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border rounded-xl"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 text-white px-6 py-2 rounded-xl font-black text-sm uppercase hover:bg-slate-700"
          >
            PDF / Imprimir
          </button>
        </div>

        {/* Registro y Totales (Mensual y Anual) - Oculto en impresión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
          <RegistroGasto onExito={() => setRefresh((prev) => prev + 1)} />
          <TotalGastos totalMes={totalMes} totalAnual={totalAnual} />
        </div>

        {/* Contenedor Imprimible: Incluye título y el total del periodo */}
        <div className="printable-area">
          <div className="hidden print:block mb-8 text-center">
            <h1 className="text-4xl font-black text-slate-900 uppercase">
              Informe de Egresos
            </h1>
            <p className="text-slate-500 font-bold">
              Periodo: {fechaInicio} al {fechaFin}
            </p>
          </div>
          <TablaGastos gastos={gastos} />
          <div className="hidden print:block mb-8 text-center">
            {/* Contenedor Padre con flex */}
            <div className="flex justify-end">
              <div className="mt-4 p-4 bg-slate-100 rounded-2xl border border-slate-200">
                <p className="text-xs font-black uppercase text-slate-500">
                  TOTAL EGRESOS
                </p>
                <h2 className="text-2xl font-black text-slate-900">
                  {totalMes.toLocaleString("es-BO", {
                    style: "currency",
                    currency: "BOB",
                  })}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
