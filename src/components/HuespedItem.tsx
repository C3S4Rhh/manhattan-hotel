/**
 de checkout 
 */

export function HuespedItem({ item, onRetirar }: { item: any, onRetirar: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="overflow-hidden">
        <p className="text-sm font-bold text-slate-800 truncate">{item.clientes?.nombre}</p>
        <p className="text-[10px] text-slate-500 font-medium">{item.clientes?.profesion || 'Sin profesión'}</p>
      </div>
      <button 
        onClick={() => onRetirar(item.id)}
        className="bg-rose-100 text-rose-600 text-[9px] font-black px-3 py-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all uppercase"
      >
        Retirar
      </button>
    </div>
  )
}