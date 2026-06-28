/**
 de checkout 
 */

interface HuespedItemProps {
  item: any;
  fechaIngreso: string | undefined;
  onRetirar: (id: string) => void;
}

export function HuespedItem({ item, fechaIngreso, onRetirar }: HuespedItemProps) {
  
  const formatearFecha = (isoString: string) => {
    if (!isoString) return { fecha: "N/A", hora: "--:--" };
    
    // Extraemos componentes sin convertir a zona horaria local
    const [fechaParte, horaCompleta] = isoString.split('T');
    const [año, mes, dia] = fechaParte.split('-');
    const [hora, minuto] = horaCompleta.split(':');
    
    return {
      fecha: `${dia}/${mes}/${año}`,
      hora: `${hora}:${minuto}`
    };
  };

  const { fecha, hora } = formatearFecha(fechaIngreso || "");

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="overflow-hidden">
        <p className="text-sm font-bold text-slate-800 truncate">{item.clientes?.nombre}</p>
        <p className="text-[12px] text-slate-500 font-medium">{item.clientes?.profesion || 'Sin profesión'}</p>
        
        <div className="flex flex-col gap-0.5 mt-1">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter italic">
            📅 INGRESO: {fecha}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">
            ⏰ HORA: {hora}
          </p>
        </div>
      </div>
      
      <button 
        onClick={() => onRetirar(item.id)}
        className="bg-rose-100 text-rose-600 text-[9px] font-black px-3 py-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all uppercase"
      >
        Retirar
      </button>
    </div>
  );
}