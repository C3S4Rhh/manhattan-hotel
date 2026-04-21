'use client'

interface CheckInModalProps {
  hab: any;
  usuario: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckInModal({ hab, usuario, onClose, onSuccess }: CheckInModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Encabezado */}
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Registro de Ingreso</p>
              <h2 className="text-2xl font-black italic">HABITACIÓN #{hab?.numero}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">×</button>
          </div>
        </div>

        <form className="p-8 space-y-5" onSubmit={(e) => {
          e.preventDefault();
          alert("Registro guardado con éxito");
          onSuccess();
        }}>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre del Huésped</label>
              <input 
                required
                type="text" 
                placeholder="Ej. Juan Pérez"
                className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Documento (CI/Pasaporte)</label>
              <input 
                required
                type="text" 
                placeholder="1234567 LP"
                className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50 text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Responsable (Automático) */}
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Responsable del Registro</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {usuario?.nombre?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-black text-blue-900">{usuario?.nombre || 'Usuario'}</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all uppercase text-xs"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase text-xs tracking-widest"
            >
              Confirmar Ingreso
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}