'use client'
import { useState } from 'react'
import { authService } from '@/services/auth'
import PanelPersonalModal from './PanelPersonal' 

interface Props {
  usuario: any
  onCajaClick?: () => void
  onDatosClick?: () => void // <--- IMPORTANTE: Añade esta línea
}

export function Navbar({ usuario, onCajaClick, onDatosClick }: Props) { // <--- Desestructura aquí
  const [verUsuarios, setVerUsuarios] = useState(false)

  const handleLogout = () => {
    authService.logout()
    window.location.reload() 
  }

  const esAdmin = usuario?.rol === 'administrador'

  return (
    <>
      <nav className="bg-slate-900 text-white p-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        {/* ... (Logo igual que antes) ... */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg rotate-3">
            <span className="text-xl font-black italic">M</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none uppercase">Manhattan</h1>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">five star</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Botón Caja */}
          {onCajaClick && (
            <button onClick={onCajaClick} className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-slate-700 uppercase tracking-wider">
              💼 Control de Caja
            </button>
          )}
          
          {/* === BOTÓN DATOS CORREGIDO === */}
         {onDatosClick && (
  <button
    onClick={onDatosClick} // <--- CAMBIO: Ejecuta la función, no cambia la URL
    className="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-emerald-500/20 uppercase tracking-wider"
  >
    📊 Datos
  </button>
)}
          {/* ... (resto del código igual) ... */}
          {esAdmin && (
            <button onClick={() => setVerUsuarios(true)} className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-blue-500/20 uppercase tracking-wider">
              👥 Gestionar Personal
            </button>
          )}
          
          <button onClick={handleLogout} className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-5 py-2 rounded-xl text-[10px] font-black transition-all border border-rose-500/20 uppercase">
            Cerrar Turno
          </button>
        </div>
      </nav>
      {/* ... (Renderizado de modal) ... */}
    </>
  )
}