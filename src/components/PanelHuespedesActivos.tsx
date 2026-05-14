"use client";
import { useListaHuespedes } from "@/hook/useListaHuespedes";

export function PanelHuespedesActivos() {
  const { huespedes, cargando } = useListaHuespedes();

  if (cargando)
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold animate-pulse">
          CARGANDO DIRECTORIO...
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
      {/* Cabecera del Panel */}
      <div className="bg-slate-900 p-8 flex justify-between items-center">
        <div>
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter">
            Huéspedes en Casa
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Directorio Detallado de Clientes
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
          <span className="text-emerald-400 font-black text-xl">
            {huespedes.length}
          </span>
          <span className="text-emerald-500 text-[10px] font-black uppercase ml-2 italic">
            Activos
          </span>
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
            {huespedes.map((h) => (
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
                    🆔 {h.clientes?.documento}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">
                    💼 {h.clientes?.profesion || "No especificado"}
                  </p>
                  <p className="text-[9px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-md inline-block font-black uppercase tracking-tighter">
                    {/* CAMBIO AQUÍ: Usamos la variable que ya viene formateada del hook */}
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

        {huespedes.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-300 font-black uppercase text-xs italic tracking-widest">
              No hay huéspedes registrados en este momento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
