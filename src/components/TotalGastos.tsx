// Definimos los tipos para las props que recibe el componente
interface TotalGastosProps {
  totalMes: number;
  totalAnual: number;
}

export function TotalGastos({ totalMes, totalAnual }: TotalGastosProps) {
  return (
    <div className="space-y-4">
      {/* Tarjeta Mensual */}
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
          Total Egresos Mensuales
        </p>
        <h2 className="text-3xl font-black mt-2">
          {totalMes.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
        </h2>
      </div>

      {/* Tarjeta Anual */}
      <div className="bg-white border-2 border-slate-900 p-8 rounded-3xl text-slate-900 shadow-sm">
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
          Total Egresos Anuales
        </p>
        <h2 className="text-3xl font-black mt-2">
          {totalAnual.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
        </h2>
      </div>
    </div>
  );
}