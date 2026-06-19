export function ClientCard({ data }: { data: any }) {
  const saldoPendiente = data.precio_acordado - data.a_cuenta;
  function calcularEdad(fechaNacimiento: string | undefined) {
  if (!fechaNacimiento) return "-";
  
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}
  // Lógica de colores según el estado
  const isFinalizado = data.estado === 'finalizado';
  
  // Estilos dinámicos
  const borderColor = isFinalizado ? 'border-l-emerald-500' : 'border-l-blue-600';
  const badgeBg = isFinalizado ? 'bg-emerald-50' : 'bg-blue-50';
  const badgeText = isFinalizado ? 'text-emerald-600' : 'text-blue-600';
  
  // Extraemos la información del cliente de forma segura
  const infoCliente = data.detalle_hospedaje_huespedes?.[0]?.clientes || {};

  return (
    <div className={`bg-white p-5 rounded-2xl border-l-4 ${borderColor} shadow-lg border border-slate-100 hover:shadow-xl transition-all`}>
      {/* Encabezado: Habitación y Estado */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Habitación #{data.habitaciones?.numero}
        </span>
        <span className={`text-[9px] font-black ${badgeBg} ${badgeText} px-2 py-1 rounded-lg uppercase`}>
          {data.estado}
        </span>
      </div>
      
      {/* Datos del Titular */}
      <div className="space-y-1 mb-4">
        <p className="text-sm font-black text-slate-800">{data.nombre_huesped}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Titular Principal</p>
      </div>

      {/* Perfil del Cliente */}
      <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <p><span className="text-slate-400">DOC:</span> {infoCliente.documento || "N/A"}</p>
        <p><span className="text-slate-400">EDAD:</span> {calcularEdad(infoCliente.fecha_nacimiento)} años</p>
          <p><span className="text-slate-400">NAC:</span> {infoCliente.nacionalidad || "N/A"}</p>
          <p><span className="text-slate-400">EST. CIVIL:</span> {infoCliente.estado_civil || "N/A"}</p>
<p><span className="text-slate-400">PROF:</span> {infoCliente.profesion || "N/A"}</p>
          <p><span className="text-slate-400">CEL: </span> {infoCliente.celular || "N/A"}</p>

          
        </div>
      </div>

      {/* Datos Financieros */}
      <div className="grid grid-cols-2 gap-2 text-[10px] mt-4 mb-2">
        <div className="bg-slate-50 p-2 rounded-lg">
          <p className="text-slate-400 font-bold uppercase">Total</p>
          <p className="font-black text-slate-700">{data.precio_acordado || 0} Bs.</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg">
          <p className="text-slate-400 font-bold uppercase">Pagado</p>
          <p className="font-black text-emerald-600">{data.a_cuenta || 0} Bs.</p>
        </div>
      </div>

      {/* Saldo Pendiente */}
      <div className={`p-2 rounded-lg text-center ${saldoPendiente > 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
        <p className={`font-bold uppercase text-[9px] ${saldoPendiente > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
          Saldo Pendiente
        </p>
        <p className={`font-black text-sm ${saldoPendiente > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
          {saldoPendiente.toFixed(2)} Bs.
        </p>
      </div>
    </div>
  );
}