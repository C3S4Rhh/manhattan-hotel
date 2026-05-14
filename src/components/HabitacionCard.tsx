'use client'

export function HabitacionCard({ hab, onSelect }: { hab: any, onSelect: (h: any) => void }) {
  const isLibre = hab.estado_actual === 'L';

  const getIcon = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('simple')) return '👤';
    if (t.includes('doble')) return '👥';
    if (t.includes('matrimonial')) return '💒';
    if (t.includes('triple')) return '👨‍👩‍👦';   // Icono para Triple
    if (t.includes('familiar')) return '👨‍👩‍👧‍👦'; // Icono para Familiar
    return '🏨';
  };

  return (
    <div 
      onClick={() => onSelect(hab)}
      className={`group cursor-pointer transition-all duration-500 transform hover:-translate-y-2 rounded-3xl p-6 border-b-8 shadow-2xl relative overflow-hidden bg-white ${
        isLibre ? 'border-emerald-500 shadow-emerald-100/50' : 'border-rose-500 shadow-rose-100/50'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">#{hab.numero}</h3>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest italic">{hab.tipo}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
          isLibre ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {isLibre ? '• Libre' : '• Ocupada'}
        </span>
      </div>
      
      <div className="mt-8 flex items-center justify-between">
        <span className="text-4xl filter drop-shadow-lg group-hover:scale-125 transition-transform duration-300">
          {getIcon(hab.tipo)}
        </span>
        <div className="text-right">
            <p className="text-[8px] font-bold text-slate-300 uppercase leading-none">Precio Base</p>
            <p className="text-xl font-black text-slate-700 tracking-tighter">Bs. {hab.precio_base}</p>
        </div>
      </div>
    </div>
  )
}