'use client'

interface HeaderProps {
  verHuespedes: boolean;
  setVerHuespedes: (v: boolean) => void;
  soloOcupadas: boolean;
  setSoloOcupadas: (v: boolean) => void;
  usuarioNombre: string;
  cantidadHuespedes: number;
}

export function DashboardHeader({ 
  verHuespedes, setVerHuespedes, soloOcupadas, setSoloOcupadas, usuarioNombre, cantidadHuespedes 
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          {verHuespedes ? 'Directorio de Huéspedes' : soloOcupadas ? 'Gestión de Salidas (Check-out)' : 'Estado de Habitaciones'}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Hotel Manhattan • {usuarioNombre}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            setVerHuespedes(!verHuespedes);
            if (soloOcupadas) setSoloOcupadas(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-sm border transition-all ${
            verHuespedes ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-800 border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span className="text-lg">👥</span>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase leading-none tracking-tighter text-slate-400">En Casa</p>
            <p className="text-sm font-black">{cantidadHuespedes} Huéspedes</p>
          </div>
        </button>

        <button 
          onClick={() => {
            setSoloOcupadas(!soloOcupadas);
            if (verHuespedes) setVerHuespedes(false);
          }}
          className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
            soloOcupadas ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-blue-400'
          }`}
        >
          {soloOcupadas ? 'Ver Todo' : '🔔 Pendientes de Salida'}
        </button>
      </div>
    </div>
  )
}