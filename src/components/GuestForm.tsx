
/**
 de check_ins 
 */
interface GuestFormProps {
  index: number;
  huesped: any;
  onChange: (index: number, campo: string, valor: string) => void;
}

export function GuestForm({ index, huesped, onChange }: GuestFormProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
      <p className="text-[9px] font-bold text-blue-500 uppercase">
        Huésped #{index + 1} {index === 0 ? '(Titular)' : ''}
      </p>
      <input 
        required
        placeholder="Nombre Completo"
        value={huesped.nombre}
        onChange={(e) => onChange(index, 'nombre', e.target.value)}
        className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-sm placeholder:font-normal"
      />
      <div className="grid grid-cols-2 gap-3">
        <input 
          required
          placeholder="CI / Pasaporte"
          value={huesped.documento}
          onChange={(e) => onChange(index, 'documento', e.target.value)}
          className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-xs placeholder:font-normal"
        />
        <input 
          placeholder="Profesión"
          value={huesped.profesion}
          onChange={(e) => onChange(index, 'profesion', e.target.value)}
          className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-xs placeholder:font-normal"
        />
      </div>
      <input 
        type="tel"
        placeholder="Celular de Referencia"
        value={huesped.celular}
        onChange={(e) => onChange(index, 'celular', e.target.value)}
        className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-xs placeholder:font-normal"
      />
    </div>
  );
}