export function TablaGastos({ gastos }: { gastos: any[] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Fecha</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Descripción</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Categoría</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase">Pago</th>
            <th className="p-4 font-black text-slate-400 text-[10px] uppercase text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-600">
                {new Date(g.fecha || g.created_at).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm font-black text-slate-800">{g.descripcion}</td>
              <td className="p-4 text-xs font-bold text-slate-500 uppercase">{g.categoria}</td>
              <td className="p-4 text-xs font-bold text-slate-500 uppercase">{g.tipo_pago}</td>
              <td className="p-4 text-sm font-black text-rose-600 text-right">
                {parseFloat(g.monto).toFixed(2)} Bs.
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}