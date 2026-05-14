"use client";

interface HeaderProps {
  verHuespedes: boolean;
  setVerHuespedes: (v: boolean) => void;
  soloOcupadas: boolean;
  setSoloOcupadas: (v: boolean) => void;
  usuarioNombre: string;
  cantidadHuespedes: number;
  onConfigClick: () => void;
  onClientesClick: () => void; // <--- Nueva prop para Clientes
}

export function DashboardHeader({
  verHuespedes,
  setVerHuespedes,
  soloOcupadas,
  setSoloOcupadas,
  usuarioNombre,
  cantidadHuespedes,
  onConfigClick,
  onClientesClick, // <--- La recibimos aquí
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          {verHuespedes
            ? "Directorio de Huéspedes"
            : soloOcupadas
              ? "Gestión de Salidas (Check-out)"
              : "Estado de Habitaciones"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Hotel Manhattan • {usuarioNombre}
        </p>
      </div>

      <div className="flex items-center gap-4">
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
          className={`px-6 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${
            soloOcupadas
              ? "bg-rose-600 text-white shadow-lg shadow-rose-200"
              : "bg-white text-slate-600 border-2 border-slate-100 hover:border-blue-400"
          }`}
        >
          {soloOcupadas ? "Ver Todo" : "🔔 Pendientes de Salida"}
        </button>

        {/* --- NUEVO: Botón de Registros de Clientes --- */}
        <button
          onClick={onClientesClick}
          className="flex items-center gap-3 bg-white p-1 px-5 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all"
        >
          <div className="bg-blue-50 p-1.5 rounded-lg">📁</div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
            Reg. de Clientes
          </span>
        </button>
       {/* Botón Habitaciones */}
<button 
  onClick={onConfigClick}
  className="flex items-center gap-3 bg-white p-1 px-5 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all"
>
  <div className="bg-orange-50 p-1.5 rounded-lg">
    ⚙️
  </div>
  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
    Habitaciones
  </span>
</button>
      </div>
    </div>
  );
}
