'use client'
import { authService } from '@/services/auth'

interface Props {
  usuario: any
}

export function Navbar({ usuario }: Props) {
  const handleLogout = () => {
    authService.logout()
    window.location.reload() // Recarga para limpiar el estado
  }

  return (
    <nav className="bg-slate-900 text-white p-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
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
        <div className="text-right border-r border-slate-700 pr-6 hidden md:block">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Operador</p>
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
  )
}