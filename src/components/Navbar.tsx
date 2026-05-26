'use client'
import { useState } from 'react'
import { authService } from '@/services/auth'
import PanelPersonalModal from './PanelPersonal' // O como manejes el llamado de la lista de usuarios

interface Props {
  usuario: any
}

export function Navbar({ usuario }: Props) {
  const [verUsuarios, setVerUsuarios] = useState(false)

  const handleLogout = () => {
    authService.logout()
    window.location.reload() // Recarga para limpiar el estado
  }

  // Evaluamos si es administrador
  const esAdmin = usuario?.rol === 'administrador'

  return (
    <>
      <nav className="bg-slate-900 text-white p-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        {/* Lado Izquierdo: Logo */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg rotate-3">
            <span className="text-xl font-black italic">M</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none uppercase">Manhattan</h1>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">five star</p>
          </div>
        </div>

        {/* Lado Derecho: Acciones y Operador */}
        <div className="flex items-center gap-6">
          
          {/* CRITICAL ACCESIBILITY: Solo el Administrador ve este botón */}
          {esAdmin && (
            <button
              onClick={() => setVerUsuarios(true)}
              className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-blue-500/20 uppercase tracking-wider"
            >
              👥 Gestionar Personal
            </button>
          )}

          <div className="text-right border-r border-slate-700 pr-6 hidden md:block">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
              {usuario?.rol || 'Operador'} {/* Muestra el rol actual para control visual */}
            </p>
            <p className="text-xs font-bold text-blue-100">{usuario?.nombre}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-5 py-2 rounded-xl text-[10px] font-black transition-all border border-rose-500/20 uppercase"
          >
            Cerrar Turno
          </button>
        </div>
      </nav>

      {/* Renderizado del Panel de Usuarios como una capa superpuesta (Modal) */}
      {verUsuarios && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl relative max-h-[90vh] overflow-y-auto rounded-[2.5rem]">
            {/* Botón flotante para cerrar la administración de personal */}
            <button 
              onClick={() => setVerUsuarios(false)}
              className="absolute top-6 right-8 z-10 bg-rose-500 text-white w-10 h-10 rounded-full font-black text-sm hover:scale-110 active:scale-95 transition-all shadow-lg"
            >
              ✕
            </button>
            <PanelPersonalModal />
          </div>
        </div>
      )}
    </>
  )
}