"use client";
import { useListaHuespedes } from "@/hook/useListaHuespedes";
import { User, Calendar, Clock, Briefcase, Phone } from "lucide-react";

export function ListaClientesActivos() {
  const { huespedes, cargando } = useListaHuespedes();

  if (cargando) {
    return (
      <div className="p-10 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">
        Cargando huéspedes activos...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50/50">
      {huespedes.map((h) => (
        <div
          key={h.id}
          className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center p-4 gap-6 transition-all hover:shadow-md"
        >
          {/* Badge de Habitación */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-white relative shadow-inner">
              <span className="text-[10px] font-bold opacity-40 absolute top-3">
                #
              </span>
              <span className="text-2xl font-black italic mt-2">
                {h.habitacion_nro}
              </span>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="flex-grow flex flex-col gap-1">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
              {h.clientes?.nombre || "Huésped sin nombre"}
            </h3>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[11px]">
                <Calendar size={12} />
                <span className="uppercase">
                  INGRESO: {h.hospedajes?.fecha_ingreso || "1/5/2026"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-pink-400 font-bold text-[11px]">
                <Clock size={12} />
                <span className="uppercase">
                  HORA:{" "}
                  {h.hospedajes?.hora_ingreso
                    ? new Date(
                        `2000-01-01T${h.hospedajes.hora_ingreso}`,
                      ).toLocaleTimeString("es-BO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "---"}
                </span>
              </div>
            </div>
          </div>

          {/* Documento y Profesión (Solo visible en Desktop) */}
          <div className="hidden md:flex flex-col gap-2 min-w-[140px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-5 bg-indigo-100 rounded flex items-center justify-center text-[10px] font-bold text-indigo-600">
                ID
              </div>
              <span className="text-xs font-bold text-slate-700">
                {h.clientes?.documento || "---"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[100px]">
                {h.clientes?.profesion || "General"}
              </span>
            </div>
          </div>

          {/* RESPONSABLE - Ajustado para leer la columna de la DB */}
          <div className="bg-indigo-50/50 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-100/50">
            <User size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
              RESP:{" "}
              <span className="text-indigo-600 ml-1">
                {/* Intenta leer responsable_nombre, si no existe usa h.responsable o el del objeto anidado */}
                {h.responsable_nombre ||
                  h.responsable ||
                  h.hospedajes?.responsable ||
                  "S/N"}
              </span>
            </span>
          </div>

          {/* Botón WhatsApp */}
          <a
            href={`https://wa.me/${h.clientes?.celular}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto bg-emerald-100 px-6 py-3 rounded-2xl flex items-center gap-2 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all group shadow-sm active:scale-95"
          >
            <span className="text-[11px] font-black uppercase tracking-widest">
              Whatsapp
            </span>
            <Phone
              size={16}
              className="group-hover:rotate-12 transition-transform"
            />
          </a>
        </div>
      ))}

      {huespedes.length === 0 && (
        <div className="p-20 text-center text-slate-300 font-bold uppercase italic">
          No hay huéspedes activos en este momento
        </div>
      )}
    </div>
  );
}
