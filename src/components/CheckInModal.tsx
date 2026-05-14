'use client'
import { useCheckIn } from '@/hook/useCheckIn'
import { GuestForm } from './GuestForm'

export function CheckInModal({ hab, usuario, onClose, onSuccess }: any) {
  const {
    numPersonas, huespedes, fechaIngreso, precioFinal, adelanto, cargando,
    setPrecioFinal, setAdelanto, setFechaIngreso,
    manejarCambioPersonas, actualizarHuesped, registrarIngreso
  } = useCheckIn(hab, usuario, onSuccess);

  // Determinar el nombre a mostrar en el badge inferior
  const displayResponsable = usuario?.nombre || usuario?.user_metadata?.nombre || 'Cesar';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Check-In Detallado</p>
              <h2 className="text-2xl font-black italic">HABITACIÓN #{hab?.numero}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">×</button>
          </div>
        </div>

        <form className="p-8 space-y-6 overflow-y-auto" onSubmit={registrarIngreso}>
          {/* Grid de Precios y Personas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nº de Personas</label>
              <select 
                value={numPersonas}
                onChange={(e) => manejarCambioPersonas(Number(e.target.value))}
                className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50 font-bold"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Pax</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Precio Total (Bs.)</label>
              <input 
                type="number"
                value={precioFinal}
                onChange={(e) => setPrecioFinal(Number(e.target.value))}
                className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50 font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Adelanto (Bs.)</label>
              <input 
                type="number"
                value={adelanto}
                onChange={(e) => setAdelanto(Number(e.target.value))}
                className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-emerald-50/50 font-bold text-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ingreso</label>
              <input 
                type="datetime-local"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50 font-bold text-xs"
              />
            </div>
          </div>

          {/* Listado de huéspedes */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Fichas de Clientes</p>
            {huespedes.map((h, i) => (
              <GuestForm key={i} index={i} huesped={h} onChange={actualizarHuesped} />
            ))}
          </div>

          {/* Badge del Responsable */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase">Responsable del Registro:</span>
            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
              👤 {displayResponsable}
            </span>
          </div>

          {/* Botones */}
          <div className="pt-2 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all uppercase text-xs">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={cargando}
              className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase text-xs tracking-widest"
            >
              {cargando ? 'Guardando...' : 'Finalizar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}