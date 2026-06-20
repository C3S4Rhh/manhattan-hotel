export function TablaIngresos({ ingresos }: { ingresos: any[] }) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b uppercase text-[10px] text-slate-400">
          <th className="p-4">Fecha</th>
          <th className="p-4">Descripción</th>
          <th className="p-4">Categoría</th>
          <th className="p-4 text-right">Monto</th>
        </tr>
      </thead>
      <tbody>
        {ingresos.map((i) => (
          <tr key={i.id} className="border-b hover:bg-slate-50">
            <td className="p-4 font-bold">{new Date(i.fecha).toLocaleDateString()}</td>
            <td className="p-4 font-black">{i.descripcion}</td>
            <td className="p-4 uppercase text-xs">{i.categoria}</td>
            <td className="p-4 text-right font-black text-emerald-600">+{parseFloat(i.monto).toFixed(2)} Bs.</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}