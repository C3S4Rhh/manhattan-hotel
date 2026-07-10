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
  const borderColor = isFinalizado ? "border-l-red-500" : "border-l-emerald-600";

  return (
    <div className={`bg-white p-5 rounded-2xl border-l-4 ${borderColor} shadow-lg border border-slate-100 hover:shadow-xl transition-all`}>
      {/* Cabecera: Habitación y Estado */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Habitación #{hospedaje.habitaciones?.numero || "N/A"}
        </span>
        <span className={`text-[9px] font-black ${isFinalizado ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"} px-2 py-1 rounded-lg uppercase`}>
          {hospedaje.estado || "Activo"}
        </span>
      </div>

      {/* Contenedor de Fechas (Organizado en Grid) */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-3 rounded-xl">
        <div className="flex flex-col">
          <p className="text-[9px] text-slate-400 font-bold uppercase">📅 Ingreso</p>
          <p className="text-[10px] font-black text-emerald-600">
            {hospedaje?.fecha_ingreso ? new Date(hospedaje.fecha_ingreso).toLocaleDateString("es-BO") : "--/--"}
          </p>
          <p className="text-[9px] text-slate-500 font-medium">
            {hospedaje?.fecha_ingreso ? new Date(new Date(hospedaje.fecha_ingreso).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </p>
        </div>

        {isFinalizado && hospedaje.fecha_salida && (
          <div className="flex flex-col border-l border-slate-200 pl-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase">🏁 Salida</p>
            <p className="text-[10px] font-black text-red-600">
              {new Date(hospedaje.fecha_salida).toLocaleDateString("es-BO")}
            </p>
            <p className="text-[9px] text-slate-500 font-medium">
              {new Date(hospedaje.fecha_salida).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>

      {/* Datos del Cliente */}
      <div className="space-y-1 mb-4">
        <p className="text-sm font-black text-slate-800 uppercase">{cliente.nombre || "Sin nombre"}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Huésped</p>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <p><span className="text-slate-400">NAC:</span> {cliente.nacionalidad || "N/A"}</p>
          <p><span className="text-slate-400">EDAD:</span> {calcularEdad(cliente.fecha_nacimiento)} años</p>
          <p><span className="text-slate-400">fecha de nac.:</span> {cliente.fecha_nacimiento || "N/A"}</p>
           <p><span className="text-slate-400">Estado Civil:</span> {cliente.estado_civil || "N/A"}</p>
          <p><span className="text-slate-400">Profesion:</span> {cliente.profesion || "N/A"}</p>
          <p><span className="text-slate-400">CARNET:</span> {cliente.documento || "N/A"}</p>
          <p><span className="text-slate-400">CEL:</span> {cliente.celular || "N/A"}</p>
          
            
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[12px] mt-4 mb-2">
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