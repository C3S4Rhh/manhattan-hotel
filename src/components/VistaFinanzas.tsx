"use client";

// Agregamos 'usuario' a las props
export function VistaFinanzas({ 
  onSelect, 
  usuario 
}: { 
  onSelect: (vista: "egresos" | "ingresos" | "ingresoshabitaciones") => void;
  usuario: any; 
}) {
  
  // Definimos permisos básicos basados en el rol
  const esAdmin = usuario?.rol === "administrador";
  const esAutorizado = ["administrador", "subadministrador", "responsable"].includes(usuario?.rol);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Centro de Finanzas</h2>
        <p className="text-slate-400 font-bold text-sm">Gestiona el flujo de caja del hotel</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        
        {/* Egresos: Solo Admin */}
        {esAdmin && (
          <button 
            onClick={() => onSelect("egresos")}
            className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">📉</div>
            <p className="font-black text-slate-800 text-lg uppercase">Egresos Operativos</p>
            <p className="text-xs text-slate-400 font-bold mt-1">Nóminas, suministros y mantenimiento.</p>
          </button>
        )}

        {/* Ingresos Extra: Admin y Responsable */}
        {esAutorizado && (
          <button 
            onClick={() => onSelect("ingresos")}
            className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">📈</div>
            <p className="font-black text-slate-800 text-lg uppercase">Ingresos Extra</p>
            <p className="text-xs text-slate-400 font-bold mt-1">Lavandería, daños y servicios extras.</p>
          </button>
        )}

        {/* Ingresos Habitaciones: Solo Admin */}
        {esAdmin && (
          <button 
            onClick={() => onSelect("ingresoshabitaciones")}
            className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">🏨</div>
            <p className="font-black text-slate-800 text-lg uppercase">Ingresos Habitaciones</p>
            <p className="text-xs text-slate-400 font-bold mt-1">Ingresos derivados de caja_movimientos.</p>
          </button>
        )}
      </div>
    </div>
  );
}