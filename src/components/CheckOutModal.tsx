/**
 de checkout 
 */
'use client'
import { useCheckOut } from '@/hook/useCheckOut'
import { HuespedItem } from './HuespedItem'

export function CheckOutModal({ hab, onClose, onSuccess }: { hab: any, onClose: () => void, onSuccess: () => void }) {
  const {
    registro, huespedesDetalle, cargando, pagoFinal, procesando, saldoLiquidado,
    setPagoFinal, retirarHuesped, realizarSalidaTotal
  } = useCheckOut(hab, onSuccess);

  if (cargando) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Rose para Checkout */}
        <div className="bg-rose-600 p-6 text-white text-center shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Gestión de Salida</p>
          <h2 className="text-3xl font-black italic">HAB. #{hab.numero}</h2>
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

          {/* Información Financiera */}
          <div className="bg-slate-900 p-4 rounded-2xl flex justify-between items-center text-white">
            <span className="text-[10px] font-bold uppercase opacity-60">Saldo a liquidar</span>
            <span className="text-xl font-black text-rose-400">Bs. {registro?.saldo_total}</span>
          </div>

          {/* Input de Pago */}
          <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100">
            <label className="text-[10px] font-black text-blue-500 uppercase mb-2 block">
              Monto del Pago Final (Bs.)
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

          {/* Acciones Finales */}
          <div className="grid gap-3 pt-2">
            <button 
              onClick={realizarSalidaTotal}
              disabled={!saldoLiquidado || procesando}
              className={`font-black py-4 rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest ${
                saldoLiquidado 
                  ? 'bg-emerald-600 text-white hover:scale-[1.02]' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
    </div>
  )
}