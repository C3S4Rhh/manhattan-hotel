'use client'
import { useCheckOut } from '@/hook/useCheckOut'
import { HuespedItem } from './HuespedItem'
import { useState } from 'react'; // <--- Asegúrate de importar useState
import { CambioHabitacionModal } from './CambioHabitacionModal'; // <--- Importa el componente

export function CheckOutModal({ hab, onClose, onSuccess }: { hab: any, onClose: () => void, onSuccess: () => void }) {
const [abiertoCambio, setAbiertoCambio] = useState(false); // <--- Agrega esto
  const {
    registro, huespedesDetalle, cargando, pagoFinal, procesando, saldoLiquidado, saldoFinal,
    diasExtra, setDiasExtra, descuentoPorcentaje, setDescuentoPorcentaje,
    setPagoFinal, retirarHuesped, realizarSalidaTotal
  } = useCheckOut(hab, onSuccess);

  if (cargando) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-rose-600 p-6 text-white text-center shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Gestión de Salida</p>
          <h2 className="text-3xl font-black italic">HAB. #{hab.numero}</h2>
          {/* Botón para abrir el modal */}
  <button 
    onClick={() => setAbiertoCambio(true)} 
    className="text-[12px] font-bold text-white/80 underline mt-2 hover:text-white"
  >
    Cambiar de habitación
  </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Listado de Huéspedes */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Huéspedes en habitación</p>
            {huespedesDetalle.length > 0 ? (
              huespedesDetalle.map((item) => (
                <HuespedItem key={item.id} item={item} onRetirar={retirarHuesped} />
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">No hay huéspedes registrados.</p>
            )}
          </div>

          {/* Sección de Ajustes Manuales */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase">Medios días extra</label>
              <input 
                type="number" step="0.5" value={diasExtra} 
                onChange={(e) => setDiasExtra(Number(e.target.value))} 
                className="w-full p-2 rounded-lg border text-sm font-bold" 
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase">% Descuento</label>
              <input 
                type="number" value={descuentoPorcentaje} 
                onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))} 
                className="w-full p-2 rounded-lg border text-sm font-bold text-emerald-600" 
              />
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-slate-900 p-4 rounded-2xl space-y-2 text-white">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="text-[10px] font-bold uppercase opacity-60">Ya pagado</span>
              <span className="text-md font-bold text-blue-400">Bs. {registro?.a_cuenta || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] font-bold uppercase opacity-60">Total a pagar (Final)</span>
              <span className="text-xl font-black text-emerald-400">Bs. {saldoFinal}</span>
            </div>
          </div>

          {/* Input de Pago */}
          <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100">
            <label className="text-[10px] font-black text-blue-500 uppercase mb-2 block">
              Monto que entrega el cliente (Bs.)
            </label>
            <input
              type="number"
              value={pagoFinal}
              onChange={(e) => setPagoFinal(Number(e.target.value))}
              className={`w-full bg-white border-2 p-4 rounded-xl text-2xl font-black outline-none transition-all ${
                saldoLiquidado ? 'border-emerald-400 text-emerald-600' : 'border-rose-300 text-rose-500'
              }`}
            />
          </div>

          <div className="grid gap-3 pt-2">
            <button
              onClick={realizarSalidaTotal}
              disabled={!saldoLiquidado || procesando}
              className={`font-black py-4 rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest ${
                saldoLiquidado ? 'bg-emerald-600 text-white hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {procesando ? 'Procesando...' : 'Finalizar Estancia Total'}
            </button>
            <button onClick={onClose} type="button" className="text-slate-400 font-bold text-[10px] uppercase tracking-widest py-2 text-center">
              Volver
            </button>
          </div>
        </div>
      </div>
      {abiertoCambio && (
  <CambioHabitacionModal 
    hab={hab} 
    registro={registro} 
    onClose={() => setAbiertoCambio(false)} 
    onSuccess={onSuccess} 
  />
)}
    </div>
  )
}