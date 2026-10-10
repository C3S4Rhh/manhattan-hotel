"use client";
import { useState } from "react";
import { authService } from "@/services/auth";
import { supabase } from "@/lib/supabase";
import PanelPersonal from "./PanelPersonal";
import { HistorialCambios } from "./HistorialCambios"; 
import { GestionCaja } from "./GestionCaja";
import { HistorialCajas } from "./HistorialCajas";
import { GestionEgresos } from "./GestionEgresos";

interface Props {
  usuario: any; 
  setVista: (vista: any) => void;
  onCajaClick?: () => void;
  onDatosClick?: () => void;
  onHistorialClick?: () => void;
  onCajaChicaClick?: () => void;
  onEgresosClick?: () => void;
  onCajaChange?: () => void;
}

// Componente pequeño para el modal de cambio de contraseña
function CambiarPasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleUpdate = async () => {
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) alert("Error: " + error.message);
    else {
      alert("Contraseña actualizada correctamente");
      onClose();
    }
    setCargando(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
        <h3 className="font-black text-lg sm:text-xl mb-4 uppercase tracking-tighter">
          Cambiar mi contraseña
        </h3>
        <input
          type="password"
          placeholder="Nueva contraseña"
          className="w-full p-3 sm:p-4 bg-slate-100 rounded-2xl mb-4 font-bold outline-none border-2 border-slate-100 focus:border-blue-500 text-sm"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 p-3 text-slate-400 font-black uppercase text-[10px]"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            disabled={cargando}
            className="flex-1 bg-blue-600 text-white rounded-xl p-3 font-black uppercase text-[10px]"
          >
            {cargando ? "Guardando..." : "Cambiar Clave"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Navbar({
  usuario,
  setVista,
  onCajaClick,
  onDatosClick,
  onHistorialClick,
  onCajaChicaClick,
  onEgresosClick,
  onCajaChange,
}: Props) {
  const [verUsuarios, setVerUsuarios] = useState(false);
  const [verCambiarPass, setVerCambiarPass] = useState(false);
  const [verHistorial, setVerHistorial] = useState(false);
  const [verCaja, setVerCaja] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const esAdmin = usuario?.rol === "administrador";
  const esAutorizado = [
    "administrador",
    "subadministrador",
    "responsable",
  ].includes(usuario?.rol);
  const puedeGestionarCaja = [
    "administrador",
    "subadministrador",
    "responsable",
  ].includes(usuario?.rol);

  return (
    <>
      <nav className="bg-slate-900 text-white py-3 px-4 sm:px-8 relative sticky top-0 z-50 shadow-2xl">
        {/* Fila Principal de la Barra */}
        <div className="flex justify-between items-center">
          
          {/* Lado Izquierdo: Logo y Botón Menú Hamburguesa */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg rotate-3">
              <span className="text-lg sm:text-xl font-black italic">M</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tighter leading-none uppercase">
                Manhattan
              </h1>
            </div>

           
          </div>

          {/* Lado Derecho: Usuario y Cerrar Turno */}
          <div className="flex items-center gap-3">
             {/* Botón Hamburguesa junto al logo para mejor acceso móvil */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-black transition-all border border-slate-700 flex items-center gap-1.5"
              title="Ocultar/Mostrar opciones"
            >
              <span>{isOpen ? "✕" : "☰"}</span>
              <span className="text-[10px] uppercase hidden sm:inline">{isOpen ? "Cerrar" : "Menú"}</span>
            </button>
            {/* Información del Usuario */}
            <div className="text-right border-r border-slate-700 pr-3 sm:pr-6 hidden md:block">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                {usuario?.rol || "Operador"}
              </p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setVerCambiarPass(true)}
                  className="hover:text-blue-400 transition-colors"
                  title="Cambiar Contraseña"
                >
                  🔑
                </button>
                <p className="text-xs font-bold text-blue-100">
                  {usuario?.nombre}
                </p>
              </div>
            </div>

            {/* Botón Cerrar Turno */}
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-3 sm:px-5 py-2 rounded-xl text-[10px] font-black transition-all border border-rose-500/20 uppercase whitespace-nowrap"
            >
              Cerrar Turno
            </button>
          </div>
        </div>

        {/* Menú Desplegable Responsivo (Se expande debajo del nav principal sin romper diseño) */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-[500px] opacity-100 mt-3 pt-3 border-t border-slate-800" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {esAutorizado && (
              <button
                onClick={() => { setVista("finanzas"); setIsOpen(false); }}
                className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black transition-all border border-rose-500/20 uppercase tracking-wider whitespace-nowrap"
              >
                📊 Finanzas
              </button>
            )}
            {esAutorizado && (
              <button
                onClick={() => { if(onCajaClick) onCajaClick(); setIsOpen(false); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-slate-700 uppercase tracking-wider whitespace-nowrap"
              >
                💼 Admin Caja
              </button>
            )}
            {esAutorizado && (
              <button
                onClick={() => { if(onCajaChicaClick) onCajaChicaClick(); setIsOpen(false); }}
                className="bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black transition-all border border-indigo-500/20 uppercase tracking-wider whitespace-nowrap"
              >
                💰 Caja Chica
              </button>
            )}
            {esAutorizado && onDatosClick && (
              <button
                onClick={() => { onDatosClick(); setIsOpen(false); }}
                className="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-emerald-500/20 uppercase tracking-wider whitespace-nowrap"
              >
                📊 Datos
              </button>
            )}

            {puedeGestionarCaja && (
              <button
                onClick={() => { setVerCaja(true); setIsOpen(false); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black transition-all border border-slate-700 uppercase tracking-wider whitespace-nowrap"
              >
                💼 Caja
              </button>
            )}

            {esAutorizado && (
              <button
                onClick={() => { if(onHistorialClick) onHistorialClick(); setIsOpen(false); }}
                className="bg-purple-500/10 hover:bg-purple-600 text-purple-400 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black transition-all border border-purple-500/20 uppercase tracking-wider whitespace-nowrap"
              >
                📜 Historial Caja
              </button>
            )}

            {esAutorizado && (
              <button
                onClick={() => { setVerHistorial(true); setIsOpen(false); }}
                className="bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black transition-all border border-amber-500/20 uppercase tracking-wider whitespace-nowrap"
              >
                🔄 cambios de hab.
              </button>
            )}
            {esAdmin && (
              <button
                onClick={() => { setVerUsuarios(true); setIsOpen(false); }}
                className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-2 rounded-xl text-xs font-black transition-all border border-blue-500/20 uppercase tracking-wider whitespace-nowrap"
              >
                👥 Personal
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Modal Historial de Cambios */}
      {verHistorial && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-3xl relative max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setVerHistorial(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-8 bg-rose-500 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full font-black text-sm hover:scale-110 transition-all shadow-lg flex items-center justify-center"
            >
              ✕
            </button>
            <HistorialCambios />
          </div>
        </div>
      )}

      {/* Modal Personal */}
      {verUsuarios && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-5xl relative max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[2.5rem] bg-white p-4 sm:p-6 shadow-2xl">
            <button
              onClick={() => setVerUsuarios(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10 bg-rose-500 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full font-black text-sm hover:scale-110 transition-all shadow-lg flex items-center justify-center"
            >
              ✕
            </button>
            <PanelPersonal />
          </div>
        </div>
      )}

      {verCaja && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-[2rem] sm:rounded-3xl w-full max-w-sm p-6 relative shadow-2xl">
            <button
              onClick={() => {
                setVerCaja(false);
                if (onCajaChange) onCajaChange();
              }}
              className="absolute top-4 right-4 font-black text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <GestionCaja 
              usuario={usuario} 
              onClose={() => {
                setVerCaja(false);
                if (onCajaChange) onCajaChange();
              }} 
            />
          </div>
        </div>
      )}

      {/* Modal Cambiar Password */}
      {verCambiarPass && (
        <CambiarPasswordModal onClose={() => setVerCambiarPass(false)} />
      )}
    </>
  );
}
