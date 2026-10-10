"use client";

import { useState, useEffect } from "react";
import { obtenerMovimientosHabitaciones } from "@/services/cajaService";
import { supabase } from "@/lib/supabase";

export function GestionIngresosHabitaciones({ usuarioActual }: { usuarioActual?: any }) {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargandoId, setCargandoId] = useState<string | null>(null);
  
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

  const eliminarMovimiento = async (id: string) => {
    const rolUsuario = (usuarioActual?.rol || "").toLowerCase();
    if (rolUsuario !== 'administrador') {
      return alert("Solo los administradores pueden eliminar registros.");
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este registro de habitación?")) {
      return;
    }

    setCargandoId(id);

    try {
      const { error } = await supabase
        .from('caja_movimientos') 
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Detalle del error de Supabase:", error);
        alert(`No se pudo eliminar el registro: ${error.message || error.hint || 'Error desconocido'}`);
      } else {
        await cargarDatos();
      }
    } catch (err) {
      console.error("Excepción al intentar eliminar:", err);
      alert("Ocurrió un error inesperado al intentar conectar con la base de datos.");
    } finally {
      setCargandoId(null);
    }
  };

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
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-8">
      {/* Cabecera */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <h2 className="text-2xl sm:text-3xl font-black text-blue-900 uppercase tracking-tighter">
          Ingresos Habitaciones
        </h2>
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase hover:bg-emerald-700 w-full sm:w-auto transition-all shadow-md"
        >
          PDF / IMPRIMIR
        </button>
      </header>

      {/* FILA SUPERIOR: Filtros y Resumen Anual/Mensual */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch lg:items-end no-print">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col gap-2 w-full lg:w-1/3">
          <label className="text-[10px] font-black uppercase text-slate-400">
            Rango de fechas
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-xs sm:text-sm font-bold bg-slate-50"
            />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-xs sm:text-sm font-bold bg-slate-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-2/3">
          <div className="bg-slate-800 p-5 sm:p-6 rounded-3xl text-white shadow-sm">
            <p className="text-slate-400 text-[10px] font-black uppercase">
              Total Mensual
            </p>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              Bs {totales.mensual.toFixed(2)}
            </h2>
          </div>
          <div className="bg-slate-600 p-5 sm:p-6 rounded-3xl text-white shadow-sm">
            <p className="text-slate-300 text-[10px] font-black uppercase">
              Total Anual
            </p>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              Bs {totales.anual.toFixed(2)}
            </h2>
          </div>
        </div>
      </div>

      {/* Tarjetas principales de Ingresos/Egresos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 no-print">
        <div className="bg-blue-600 p-6 sm:p-8 rounded-3xl text-white shadow-md">
          <p className="text-blue-200 text-xs font-black uppercase">
            Ingresos Habitaciones
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            Bs {totalHabitaciones.toFixed(2)}
          </h2>
        </div>
        <div className="bg-emerald-600 p-6 sm:p-8 rounded-3xl text-white shadow-md">
          <p className="text-emerald-200 text-xs font-black uppercase">
            Ingresos Extra
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            Bs {totales.ingresosExtra.toFixed(2)}
          </h2>
        </div>
        <div className="bg-rose-600 p-6 sm:p-8 rounded-3xl text-white shadow-md">
          <p className="text-rose-200 text-xs font-black uppercase">
            Total Egresos
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            Bs {totales.gastos.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Área de Impresión y Tabla Responsiva */}
      <div className="printable-area">
        <div className="hidden print:block mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black uppercase text-blue-900">
              Reporte de Ingresos por Habitaciones
            </h1>
            <p className="font-bold text-slate-500 text-sm">
              Periodo: {fechaInicio.split('-').reverse().join('/')} al {fechaFin.split('-').reverse().join('/')}
            </p>
          </div>

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

        {/* Contenedor de la tabla con scroll horizontal adaptable */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[750px]">
              <thead className="border-b uppercase text-[10px] text-slate-400 bg-slate-50">
                <tr>
                  <th className="p-4 text-right">Fecha</th>
                  <th className="p-4 text-left">Recepcionista</th>
                  <th className="p-4 text-left">Huésped</th>
                  <th className="p-4 text-right">Habitación</th>
                  <th className="p-4 text-right">Efectivo</th>
                  <th className="p-4 text-right">QR</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-left">Observaciones</th>
                  {((usuarioActual?.rol || "").toLowerCase() === 'administrador') && (
                    <th className="p-4 text-center no-print">Acción</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datosVisibles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-xs font-bold text-slate-400">
                      No hay registros en el rango de fechas seleccionado.
                    </td>
                  </tr>
                ) : (
                  datosVisibles.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-xs font-medium text-slate-500 text-right whitespace-nowrap">
                        <span className="block font-bold text-slate-700">
                          {d.fecha.split("T")[0].split("-").reverse().join("/")}
                        </span>
                      </td>
                      <td className="p-4 font-black text-xs sm:text-sm text-slate-800 whitespace-nowrap">
                        {d.usuarios?.nombre || "Desconocido"}
                      </td>
                      <td className="p-4 font-black text-xs sm:text-sm text-slate-700">{d.huesped_referencia}</td>
                      <td className="p-4 font-bold text-slate-600 text-right whitespace-nowrap">
                        Hab. {d.nro_habitacion}
                      </td>
                      <td className="p-4 text-right font-black text-xs sm:text-sm text-blue-600 whitespace-nowrap">
                        {parseFloat(d.monto_efectivo || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-black text-xs sm:text-sm text-blue-600 whitespace-nowrap">
                        {parseFloat(d.monto_qr || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-black text-xs sm:text-sm text-green-600 whitespace-nowrap">
                        +{parseFloat(d.monto_total || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-xs text-slate-700 max-w-xs truncate">{d.observaciones}</td>
                      {((usuarioActual?.rol || "").toLowerCase() === 'administrador') && (
                        <td className="p-4 text-center no-print whitespace-nowrap">
                          <button
                            onClick={() => eliminarMovimiento(d.id)}
                            disabled={cargandoId === d.id}
                            className="text-rose-400 hover:text-rose-600 font-bold text-[10px] uppercase transition-colors disabled:opacity-50"
                          >
                            {cargandoId === d.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
