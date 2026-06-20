import { useState } from "react";
import { RegistroGasto } from "./RegistroGasto";
import { ListaGastos } from "./ListaGastos";

export function GestionEgresos() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
            Control de Egresos Operativos
          </h2>
          <p className="text-slate-400 font-bold">Gestión de gastos, nóminas y suministros.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RegistroGasto onExito={() => setRefresh(prev => prev + 1)} />
          <ListaGastos refreshTrigger={refresh} />
        </div>
      </div>
    </div>
  );
}