'use client'
import { useState } from 'react';
import { useListaHuespedes } from "@/hook/useListaHuespedes";

export function PanelHuespedesActivos() {
  const { huespedes, cargando } = useListaHuespedes();
  const [busqueda, setBusqueda] = useState('');

  if (cargando)
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold animate-pulse">
          CARGANDO DIRECTORIO...
        </p>
      </div>
    );

  // Filtrar huéspedes según lo que escriba el usuario
  const huespedesFiltrados = huespedes.filter((h) => {
    const texto = busqueda.toLowerCase();
    const nombre = h.clientes?.nombre?.toLowerCase() || '';
    const documento = h.clientes?.documento?.toLowerCase() || '';
    const profesion = h.clientes?.profesion?.toLowerCase() || '';
    const habitacion = h.hospedajes?.habitaciones?.numero?.toString() || '';

    return (
      nombre.includes(texto) ||
      documento.includes(texto) ||
      profesion.includes(texto) ||
      habitacion.includes(texto)
    );
  });

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
      {/* Cabecera del Panel */}
      <div className="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter">
            Huéspedes en Casa
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Directorio Detallado de Clientes
          </p>
        </div>

        {/* Buscador y Contador */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre, hab, CI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-800 text-white placeholder-slate-500 text-xs font-bold px-4 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-black"
              >
                ✕
              </button>
            )}
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl flex items-center justify-center shrink-0 w-full sm:w-auto">
            <span className="text-emerald-400 font-black text-xl">
              {huespedesFiltrados.length}
            </span>
            <span className="text-emerald-500 text-[10px] font-black uppercase ml-2 italic">
              {busqueda ? 'Filtrados' : 'Activos'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Habitación
              </th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Nombre del Huésped
              </th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Documento / Profesión
              </th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {huespedesFiltrados.map((h) => (
              <tr
                key={h.id}
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="p-6">
                  <div className="bg-slate-800 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-[10px] font-bold leading-none opacity-50">
                      #
                    </span>
                    <span className="text-lg font-black">
                      {h.hospedajes?.habitaciones?.numero}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">
                    {h.clientes?.nombre}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter italic">
                      📅 Ingreso:{" "}
                      {h.hospedajes?.fecha_ingreso
                        ? new Date(
                            h.hospedajes.fecha_ingreso,
                          ).toLocaleDateString("es-BO", {
                            timeZone: "America/La_Paz",
                          })
                        : "No registrado"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">
                      ⏰ Hora:{" "}
                      {h.hospedajes?.fecha_ingreso
                        ? new Date(
                            new Date(h.hospedajes.fecha_ingreso).getTime() +
                              new Date().getTimezoneOffset() * 60000,
                          ).toLocaleTimeString("es-BO", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "--:--"}
                    </p>
                  </div>
                </td>
                <td className="p-6">
                  <p className="text-[11px] font-black text-slate-600 uppercase mb-1">
                    CI : {h.clientes?.documento}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">
                    💼 {h.clientes?.profesion || "No especificado"}
                  </p>
                  <p className="text-[9px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-md inline-block font-black uppercase tracking-tighter">
                    👤 Resp: {h.responsable_nombre}
                  </p>
                </td>
                <td className="p-6 text-center">
                  <a
                    href={`https://wa.me/${h.clientes?.celular}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  >
                    <span>WhatsApp</span>
                    <span className="text-sm">📱</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {huespedesFiltrados.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-300 font-black uppercase text-xs italic tracking-widest">
              {busqueda ? 'No se encontraron coincidencias para la búsqueda' : 'No hay huéspedes registrados en este momento'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
