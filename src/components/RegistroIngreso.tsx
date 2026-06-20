"use client";
import { useState, useRef } from "react";
import { registrarIngreso } from "@/services/ingresosService";

export function RegistroIngreso({ onExito }: { onExito: () => void }) {
  const [cargando, setCargando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await registrarIngreso({
        descripcion: formData.get("descripcion"),
        categoria: formData.get("categoria"),
        monto: parseFloat(formData.get("monto") as string),
      });
      onExito();
      formRef.current?.reset();
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
      <h3 className="font-black text-emerald-800 uppercase text-xs tracking-widest">Nuevo Ingreso Extra</h3>
      <input name="descripcion" placeholder="Ej: Pago por daño de lámpara" className="w-full p-2 bg-slate-50 rounded-xl" required />
      <select name="categoria" className="w-full p-2 bg-slate-50 rounded-xl" required>
        <option>Lavandería</option>
        <option>Daños a propiedad</option>
        <option>Otros</option>
      </select>
      <input name="monto" type="number" placeholder="Monto Bs." className="w-full p-2 bg-slate-50 rounded-xl" required />
      <button disabled={cargando} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-black uppercase text-[10px]">
        {cargando ? "Guardando..." : "Registrar Ingreso"}
      </button>
    </form>
  );
}