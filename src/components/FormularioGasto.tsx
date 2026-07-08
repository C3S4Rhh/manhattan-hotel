"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function FormularioGasto({ usuario, onGuardar, onCancel }: any) {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoPago, setTipoPago] = useState("efectivo");

  const registrarGasto = async () => {
    if (!monto || !descripcion) return alert("Completa los campos");
    const { error } = await supabase.from("gastos").insert([{
      descripcion,
      categoria: "Gasto Operativo",
      monto: parseFloat(monto),
      tipo_pago: tipoPago,
      id_usuario: usuario.id,
      responsable: usuario.nombre,
    }]);

    if (!error) onGuardar();
    else alert("Error al registrar gasto: " + error.message);
  };

  return (
    <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 mb-6">
      <h3 className="font-black text-rose-800 uppercase text-xs mb-4">Registrar Gasto</h3>
      <input type="text" placeholder="Descripción" className="w-full p-3 rounded-xl font-bold text-sm mb-2" onChange={(e) => setDescripcion(e.target.value)} />
      <input type="number" placeholder="Monto" className="w-full p-3 rounded-xl font-bold text-sm mb-4" onChange={(e) => setMonto(e.target.value)} />
      <select className="w-full p-3 rounded-xl font-bold text-sm mb-4" value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
        <option value="efectivo">Efectivo</option>
        <option value="qr">QR</option>
      </select>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 font-black text-rose-500 uppercase text-xs">Cancelar</button>
        <button onClick={registrarGasto} className="flex-1 bg-rose-600 text-white rounded-xl font-black text-xs uppercase">Registrar</button>
      </div>
    </div>
  );
}