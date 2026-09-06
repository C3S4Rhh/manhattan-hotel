"use client";

export function VistaCentroHistorial({ 
  onSelect, 
  usuario 
}: { 
  onSelect: (vista: "historialhospedajes" | "clientes") => void; 
  usuario: any; 
}) {
  
  const esAutorizado = ["administrador", "subadministrador", "responsable"].includes(usuario?.rol);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Centro de Historiales</h2>
        <p className="text-slate-400 font-bold text-sm">Consulta de registros pasados, estancias y base de clientes</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Tarjeta 1: Historial de Hospedajes */}
        {esAutorizado && (
          <button 
            onClick={() => onSelect("historialhospedajes")}
            className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">📋</div>
            <p className="font-black text-slate-800 text-lg uppercase">Historial de Hospedajes</p>
            <p className="text-xs text-slate-400 font-bold mt-1">Revisa ingresos, salidas, habitaciones y filtros por fecha.</p>
          </button>
        )}

        {/* Tarjeta 2: Registro de Clientes (Movido aquí) */}
        <button 
          onClick={() => onSelect("clientes")}
          className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">📁</div>
          <p className="font-black text-slate-800 text-lg uppercase">Reg. de Clientes</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Base de datos general de huéspedes y documentos.</p>
        </button>

      </div>
    </div>
  );
}
