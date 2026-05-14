'use client'

export function HabitacionCard({ hab, onSelect }: { hab: any, onSelect: (h: any) => void }) {
  
  // 1. Diccionario con claves en MINÚSCULAS
  const CONFIG_ESTADOS: Record<string, { border: string, bg: string, text: string, label: string, shadow: string }> = {
    'reserva': { 
      border: 'border-violet-500', 
      bg: 'bg-violet-50', 
      text: 'text-violet-600', 
      label: 'Reserva',
      shadow: 'shadow-violet-100/50'
    },
    'ingreso': { 
      border: 'border-sky-500', 
      bg: 'bg-sky-50', 
      text: 'text-sky-600', 
      label: 'Ingreso',
      shadow: 'shadow-sky-100/50'
    },
    'permanente': { 
      border: 'border-emerald-500', 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      label: 'Permanente',
      shadow: 'shadow-emerald-100/50'
    },
    'sucio': { 
      border: 'border-rose-300', 
      bg: 'bg-rose-50', 
      text: 'text-rose-500', 
      label: 'Sucio',
      shadow: 'shadow-rose-100/50'
    },
    'alquiler': { 
      border: 'border-orange-500', 
      bg: 'bg-orange-50', 
      text: 'text-orange-600', 
      label: 'Alquiler/Admin',
      shadow: 'shadow-orange-100/50'
    },
    'admin': { 
      border: 'border-orange-500', 
      bg: 'bg-orange-50', 
      text: 'text-orange-600', 
      label: 'Alquiler/Admin',
      shadow: 'shadow-orange-100/50'
    },
    'o': { // <--- CAMBIADO A MINÚSCULA 'o' para que coincida con toLowerCase()
      border: 'border-rose-500', 
      bg: 'bg-white', 
      text: 'text-rose-600', 
      label: 'Ocupada',
      shadow: 'shadow-rose-100/50'
    },
    'l': { 
      border: 'border-emerald-500', 
      bg: 'bg-white', 
      text: 'text-emerald-600', 
      label: 'Libre',
      shadow: 'shadow-emerald-100/50'
    }
  };

  // 2. Normalización a minúsculas
  const estadoRecibido = hab.estado_actual?.toLowerCase() || 'l';
  
  // 3. Selección de estilo con respaldo (fallback)
  const estilo = CONFIG_ESTADOS[estadoRecibido] || CONFIG_ESTADOS['l'];

  const getIcon = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('simple')) return '👤';
    if (t.includes('doble')) return '👥';
    if (t.includes('matrimonial')) return '💒';
    if (t.includes('triple')) return '👨‍👩‍👦';
    if (t.includes('familiar')) return '👨‍👩‍👧‍👦';
    return '🏨';
  };

  return (
    <div 
      onClick={() => onSelect(hab)}
      className={`group cursor-pointer transition-all duration-500 transform hover:-translate-y-2 rounded-3xl p-6 border-b-8 shadow-2xl relative overflow-hidden ${estilo.bg} ${estilo.border} ${estilo.shadow}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">#{hab.numero}</h3>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest italic">{hab.tipo}</p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${estilo.text} border-current/20`}>
          • {estilo.label}
        </span>
      </div>
      
      <div className="mt-8 flex items-center justify-between">
        <span className="text-4xl filter drop-shadow-lg group-hover:scale-125 transition-transform duration-300">
          {getIcon(hab.tipo)}
        </span>
        <div className="text-right">
            <p className="text-[8px] font-bold text-slate-300 uppercase leading-none">Precio Base</p>
            <p className={`text-xl font-black tracking-tighter ${estilo.text}`}>Bs. {hab.precio_base}</p>
        </div>
      </div>
    </div>
  );
}