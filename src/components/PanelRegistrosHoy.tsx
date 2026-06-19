import { useEffect, useState } from "react";
import { obtenerRegistrosDelDia } from "@/services/hospedajesService";
import { ClientCard } from "./ClientCard";

export function PanelRegistrosHoy() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await obtenerRegistrosDelDia();
      setRegistros(data || []);
      setCargando(false);
    }
    load();
  }, []);

  if (cargando) return <p className="text-slate-400">Cargando registros...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {registros.length > 0 ? (
        registros.map((item: any) => <ClientCard key={item.id} data={item} />)
      ) : (
        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 text-slate-400 font-black uppercase">
          No hay registros de clientes el día de hoy
        </div>
      )}
    </div>
  );
}
