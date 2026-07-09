"use client";
import { useState, useEffect } from "react";
import { obtenerMovimientosHabitaciones } from "@/services/cajaService";

export function GestionIngresosHabitaciones() {
  const [datos, setDatos] = useState<any[]>([]);
  // Inicializamos los totales incluyendo mensual y anual
  const [totales, setTotales] = useState({
    gastos: 0,
    ingresosExtra: 0,
    mensual: 0,
    anual: 0,
  });
  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0],
  );

  const cargarDatos = async () => {
    const data = await obtenerMovimientosHabitaciones(fechaInicio, fechaFin);

    const movimientosLimpios = data.movimientos.filter((m) => {
      const fechaSolo = m.fecha.split("T")[0];
      return fechaSolo >= fechaInicio && fechaSolo <= fechaFin;
    });

    setDatos(movimientosLimpios);
    setTotales({
      gastos: data.totalGastos,
      ingresosExtra: data.totalIngresosExtra,
      mensual: data.totalMensual,
      anual: data.totalAnual,
    });
  };

  useEffect(() => {
    cargarDatos();
  }, [fechaInicio, fechaFin]);
  const datosVisibles = datos.filter((d) => {
    const fechaRegistro = d.fecha.split("T")[0];
    return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
  });
  const totalHabitaciones = datosVisibles.reduce(
    (sum, d) => sum + parseFloat(d.monto_total || 0),
    0,
  );
  const balanceNeto =
    totalHabitaciones + totales.ingresosExtra - totales.gastos;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      <header className="flex justify-between items-center no-print">
        <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">
          Ingresos Habitaciones
        </h2>
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase hover:bg-emerald-700"
        >
          PDF / IMPRIMIR
        </button>
      </header>

      {/* FILA SUPERIOR: Filtros y Resumen Anual/Mensual */}
      <div className="flex flex-col lg:flex-row gap-6 items-end no-print">
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-2 w-full lg:w-1/3">
          <label className="text-[10px] font-black uppercase text-slate-400">
            Rango de fechas
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border rounded-xl"
            />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full lg:w-2/3">
          <div className="bg-slate-800 p-6 rounded-3xl text-white">
            <p className="text-slate-400 text-[10px] font-black uppercase">
              Total Mensual
            </p>
            <h2 className="text-2xl font-black">
              Bs {totales.mensual.toFixed(2)}
            </h2>
          </div>
          <div className="bg-slate-600 p-6 rounded-3xl text-white">
            <p className="text-slate-300 text-[10px] font-black uppercase">
              Total Anual
            </p>
            <h2 className="text-2xl font-black">
              Bs {totales.anual.toFixed(2)}
            </h2>
          </div>
        </div>
      </div>

      {/* Tarjetas principales de Ingresos/Egresos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-blue-600 p-8 rounded-3xl text-white">
          <p className="text-blue-200 text-xs font-black uppercase">
            Ingresos Habitaciones
          </p>
          <h2 className="text-3xl font-black">
            Bs {totalHabitaciones.toFixed(2)}
          </h2>
        </div>
        <div className="bg-emerald-600 p-8 rounded-3xl text-white">
          <p className="text-emerald-200 text-xs font-black uppercase">
            Ingresos Extra
          </p>
          <h2 className="text-3xl font-black">
            Bs {totales.ingresosExtra.toFixed(2)}
          </h2>
        </div>
        <div className="bg-rose-600 p-8 rounded-3xl text-white">
          <p className="text-rose-200 text-xs font-black uppercase">
            Total Egresos
          </p>
          <h2 className="text-3xl font-black">
            Bs {totales.gastos.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Área de Impresión */}
      <div className="printable-area">
        <div className="hidden print:block mb-8">
    {/* Encabezado del reporte */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-black uppercase text-blue-900">
        Reporte de Ingresos por Habitaciones
      </h1>
      <p className="font-bold text-slate-500 text-sm">
        Periodo: {fechaInicio.split('-').reverse().join('/')} al {fechaFin.split('-').reverse().join('/')}
      </p>
    </div>

    {/* Grid de 4 tarjetas para los datos */}
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
        <p className="text-[9px] font-black uppercase text-slate-400">Habitaciones</p>
        <h2 className="text-lg font-black text-slate-700">{totalHabitaciones.toFixed(2)} Bs</h2>
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
        <p className="text-[9px] font-black uppercase text-emerald-600">Ingresos Extra</p>
        <h2 className="text-lg font-black text-emerald-800">{totales.ingresosExtra.toFixed(2)} Bs</h2>
      </div>

      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center">
        <p className="text-[9px] font-black uppercase text-rose-600">Total Egresos</p>
        <h2 className="text-lg font-black text-rose-800">{totales.gastos.toFixed(2)} Bs</h2>
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-500 text-center">
        <p className="text-[9px] font-black uppercase text-blue-700">Recaudado Final</p>
        <h2 className="text-lg font-black text-blue-900">{balanceNeto.toFixed(2)} Bs</h2>
      </div>
    </div>
  </div>

        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b uppercase text-[10px] text-slate-400">
              <tr>
                <th className="p-4 text-right">Fecha</th>
                <th className="p-4 text-left">Recepcionista</th>
                <th className="p-4 text-left">Huesped</th>
                <th className="p-4 text-right">Habitación</th>
                <th className="p-4 text-right">Efectivo</th>
                <th className="p-4 text-right">QR</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {datosVisibles.map((d) => (
                <tr key={d.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 text-xs font-medium text-slate-500">
                    <span className="block font-bold text-slate-700">
                      {d.fecha.split("T")[0].split("-").reverse().join("/")}
                    </span>
                  </td>
                  <td className="p-4 font-black">
                    {d.usuarios?.nombre || "Desconocido"}
                  </td>
                  <td className="p-4 font-black">{d.huesped_referencia}</td>
                  <td className="p-4 font-bold text-slate-600 text-right">
                    Hab. {d.nro_habitacion}
                  </td>
                  <td className="p-4 text-right font-black text-blue-600">
                    {parseFloat(d.monto_efectivo || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-black text-blue-600">
                    {parseFloat(d.monto_qr || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-black text-green-600">
                    +{parseFloat(d.monto_total || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-700">{d.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
