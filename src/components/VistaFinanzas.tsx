export function VistaFinanzas({ onSelect }: { onSelect: (vista: "egresos" | "ingresos"| "ingresoshabitaciones") => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Centro de Finanzas</h2>
        <p className="text-slate-400 font-bold text-sm">Gestiona el flujo de caja del hotel</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Card Egresos */}
        <button 
          onClick={() => onSelect("egresos")}
          className="group relative p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl">📉</span>
          </div>
          <p className="font-black text-slate-800 text-lg uppercase tracking-tight">Egresos Operativos</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Nóminas, suministros y mantenimiento.</p>
        </button>

        {/* Card Ingresos */}
        <button 
          onClick={() => onSelect("ingresos")}
          className="group relative p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl">📈</span>
          </div>
          <p className="font-black text-slate-800 text-lg uppercase tracking-tight">Ingresos Extra</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Lavandería, daños y servicios extras.</p>
        </button>
        {/* Card Ingresos Habitaciones */}
        <button 
          onClick={() => onSelect("ingresoshabitaciones")}
          className="group relative p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl">🏨</span>
          </div>
          <p className="font-black text-slate-800 text-lg uppercase tracking-tight">Ingresos Habitaciones</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Ingresos derivados de caja_movimientos.</p>
        </button>
      </div>
    </div>
  );
}