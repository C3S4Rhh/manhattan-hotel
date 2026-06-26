export function ClientCard({ data }: { data: any }) {
  const hospedaje = data.hospedajes || {};
  const cliente = data.clientes || {};
  const saldoPendiente = (hospedaje.precio_acordado || 0) - (hospedaje.a_cuenta || 0);

  function calcularEdad(fechaNacimiento: string | undefined) {
    if (!fechaNacimiento) return "-";
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  const isFinalizado = hospedaje.estado === "finalizado";
  const borderColor = isFinalizado ? "border-l-emerald-500" : "border-l-blue-600";

  return (
    <div className={`bg-white p-5 rounded-2xl border-l-4 ${borderColor} shadow-lg border border-slate-100 hover:shadow-xl transition-all`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Habitación #{hospedaje.habitaciones?.numero || "N/A"}
        </span>
        <span className={`text-[9px] font-black ${isFinalizado ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"} px-2 py-1 rounded-lg uppercase`}>
          {hospedaje.estado || "Activo"}
        </span>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-sm font-black text-slate-800">{cliente.nombre || "Sin nombre"}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Huésped</p>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <p><span className="text-slate-400">DOC:</span> {cliente.documento || "N/A"}</p>
          <p><span className="text-slate-400">EDAD:</span> {calcularEdad(cliente.fecha_nacimiento)} años</p>
          <p><span className="text-slate-400">NAC:</span> {cliente.nacionalidad || "N/A"}</p>
          <p><span className="text-slate-400">CEL:</span> {cliente.celular || "N/A"}</p>
           <p><span className="text-slate-400">Estado Civil:</span> {cliente.estado_civil || "N/A"}</p>
            <p><span className="text-slate-400">Estado Civil:</span> {cliente.fecha_nacimiento || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] mt-4 mb-2">
        <div className="bg-slate-50 p-2 rounded-lg">
          <p className="text-slate-400 font-bold uppercase">Total</p>
          <p className="font-black text-slate-700">{hospedaje.precio_acordado || 0} Bs.</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg">
          <p className="text-slate-400 font-bold uppercase">Pagado</p>
          <p className="font-black text-emerald-600">{hospedaje.a_cuenta || 0} Bs.</p>
        </div>
        
      </div>

      <div className={`p-2 rounded-lg text-center ${saldoPendiente > 0 ? "bg-rose-50" : "bg-slate-50"}`}>
        <p className="font-bold uppercase text-[9px] text-slate-400">Saldo Pendiente</p>
        <p className="font-black text-sm text-slate-800">{saldoPendiente.toFixed(2)} Bs.</p>
      </div>
    </div>
  );
}