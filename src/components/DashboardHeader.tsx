"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 

interface HeaderProps {
  verHuespedes: boolean;
  setVerHuespedes: (v: boolean) => void;
  soloOcupadas: boolean;
  setSoloOcupadas: (v: boolean) => void;
  usuarioNombre: string;
  cantidadHuespedes: number;

  onConfigClick: () => void;
  onHistorialesClick: () => void; 
  onRegistrosClick: () => void;
  onReservasClick: () => void;
}

interface Nota {
  id: string;
  created_at: string;
  usuario_nombre: string;
  contenido: string;
}

export function DashboardHeader({
  verHuespedes,
  setVerHuespedes,
  soloOcupadas,
  setSoloOcupadas,
  usuarioNombre,
  cantidadHuespedes,
  onConfigClick,
  onHistorialesClick,
  onRegistrosClick,
  onReservasClick,
}: HeaderProps) {
  const [isNotaOpen, setIsNotaOpen] = useState(false);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargarNotas = async () => {
    const { data, error } = await supabase
      .from("notas_turno")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotas(data);
    }
  };

  useEffect(() => {
    cargarNotas();
  }, []);

  const agregarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;

    setCargando(true);
    const { error } = await supabase.from("notas_turno").insert([
      {
        usuario_nombre: usuarioNombre || "Recepción",
        contenido: nuevoTexto.trim(),
      },
    ]);

    if (error) {
      alert("Error al guardar el aviso: " + error.message);
    } else {
      setNuevoTexto("");
      cargarNotas();
    }
    setCargando(false);
  };

  const eliminarNota = async (id: string) => {
    if (!confirm("¿Deseas eliminar este aviso permanentemente?")) return;

    const { error } = await supabase.from("notas_turno").delete().eq("id", id);

    if (error) {
      alert("No se pudo eliminar el aviso.");
    } else {
      cargarNotas();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            {verHuespedes
              ? "Directorio de Huéspedes"
              : soloOcupadas
                ? "Gestión de Salidas (Check-out)"
                : "Habitaciones"}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Hotel Manhattan • {usuarioNombre}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Botón de Avisos y Notas de Turno */}
          <button
            onClick={() => {
              setIsNotaOpen(true);
              cargarNotas();
            }}
            className="flex items-center gap-3 bg-amber-50 p-1 px-4 rounded-2xl shadow-sm border border-amber-100 hover:bg-amber-100 transition-all relative"
          >
            <div className="bg-white p-1.5 rounded-lg shadow-sm">📝</div>
            {notas.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-black rounded-full shadow animate-pulse">
                {notas.length}
              </span>
            )}
          </button>

          {/* Botón de Registros */}
          <button
            onClick={onRegistrosClick}
            className="flex items-center gap-3 bg-indigo-50 p-1 px-5 rounded-2xl shadow-sm border border-indigo-100 hover:bg-indigo-100 transition-all"
          >
            <div className="bg-white p-1.5 rounded-lg shadow-sm">📋</div>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
              Registros
            </span>
          </button>
          
          {/* Botón exclusivo para Reservas */}
          <button
            onClick={onReservasClick}
            className="flex items-center gap-3 bg-emerald-50 p-1 px-5 rounded-2xl shadow-sm border border-emerald-100 hover:bg-emerald-100 transition-all"
          >
            <div className="bg-white p-1.5 rounded-lg shadow-sm">🗓️</div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
              Reservas
            </span>
          </button>

          {/* Botón de Huéspedes En Casa */}
          <button
            onClick={() => {
              setVerHuespedes(!verHuespedes);
              if (soloOcupadas) setSoloOcupadas(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-sm border transition-all ${
              verHuespedes
                ? "bg-slate-800 text-white border-slate-800 shadow-lg"
                : "bg-white text-slate-800 border-slate-100 hover:bg-slate-50"
            }`}
          >
            <span className="text-lg">👥</span>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase leading-none tracking-tighter text-slate-400">
                En Casa
              </p>
              <p className="text-sm font-black">{cantidadHuespedes} Huéspedes</p>
            </div>
          </button>

          {/* Botón de Salidas */}
          <button
            onClick={() => {
              setSoloOcupadas(!soloOcupadas);
              if (verHuespedes) setVerHuespedes(false);
            }}
            className={`px-4 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${
              soloOcupadas
                ? "bg-rose-600 text-white shadow-lg shadow-rose-200"
                : "bg-white text-slate-600 border-2 border-slate-100 hover:border-blue-400"
            }`}
          >
            {soloOcupadas ? "Ver Todo" : "🔔 Pendientes de Salida"}
          </button>

          {/* Botón de Centro de Historiales (Reemplazó a Reg. de Clientes) */}
          <button
            onClick={onHistorialesClick}
            className="flex items-center gap-3 bg-white p-1 px-5 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all"
          >
            <div className="bg-indigo-50 p-1.5 rounded-lg">📜</div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              Hist. Clientes
            </span>
          </button>

          {/* Botón Habitaciones */}
          <button
            onClick={onConfigClick}
            className="flex items-center gap-3 bg-white p-1 px-5 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all"
          >
            <div className="bg-orange-50 p-1.5 rounded-lg">⚙️</div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              Habitaciones
            </span>
          </button>
        </div>
      </div>

      {/* --- MODAL DE AVISOS Y NOTAS DE TURNO --- */}
      {isNotaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center px-6 py-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📌</span>
                <h3 className="font-black text-amber-900 uppercase tracking-tight text-sm">
                  Avisos y Notas de Turno (Compartido)
                </h3>
              </div>
              <button
                onClick={() => setIsNotaOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold shadow-sm transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={agregarNota} className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
              <textarea
                value={nuevoTexto}
                onChange={(e) => setNuevoTexto(e.target.value)}
                placeholder="Escribe un aviso importante para el siguiente turno..."
                rows={3}
                className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium text-slate-700 resize-none bg-white"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={cargando || !nuevoTexto.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {cargando ? "Publicando..." : "Publicar Aviso"}
                </button>
              </div>
            </form>

            <div className="p-6 overflow-y-auto flex flex-col gap-3 flex-1">
              {notas.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">
                  No hay avisos registrados en este momento.
                </p>
              ) : (
                notas.map((nota) => (
                  <div
                    key={nota.id}
                    className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col gap-2 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase text-amber-900 bg-amber-100/60 px-2.5 py-0.5 rounded-lg">
                        👤 {nota.usuario_nombre}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(nota.created_at).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        <button
                          onClick={() => eliminarNota(nota.id)}
                          className="text-slate-400 hover:text-rose-600 text-xs font-bold transition-all p-1"
                          title="Eliminar nota"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap">
                      {nota.contenido}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setIsNotaOpen(false)}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-slate-800 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
