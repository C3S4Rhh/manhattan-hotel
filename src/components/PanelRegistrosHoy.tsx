import { useEffect, useState } from "react";
import { obtenerRegistrosDelDia } from "@/services/hospedajesService";
import { ClientCard } from "./ClientCard";

export function PanelRegistrosHoy() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Función para recargar datos
  const load = async () => {
    setCargando(true);
    const data = await obtenerRegistrosDelDia();
    setRegistros(data || []);
    setCargando(false);
  };

  useEffect(() => {
    load();

    // Refrescamos automáticamente cada 5 minutos
    // Esto asegura que si ingresa alguien nuevo, la tarjeta aparezca
    const interval = setInterval(load, 300000); 
    
    return () => clearInterval(interval);
  }, []);

  if (cargando && registros.length === 0) 
    return <p className="text-slate-400 p-10 animate-pulse">Actualizando registros...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {registros.length > 0 ? (
        registros.map((item: any) => (
          // Usamos item.id porque ahora cada fila de detalle_hospedaje_huespedes es única
          <ClientCard key={item.id} data={item} />
        ))
      ) : (
        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 text-slate-400 font-black uppercase shadow-sm">
          No hay registros de clientes el día de hoy
        </div>
      )}
    </div>
  );
}