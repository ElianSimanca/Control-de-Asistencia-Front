import { useEffect, useState } from "react";
import api from "../api/axios";
import { Button, Chip } from "@heroui/react";
import { RefreshCw } from "lucide-react";

export default function MarcacionesPage() {
  const [marcaciones, setMarcaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarMarcaciones = async () => {
    try {
      const response = await api.get("/marcaciones");
      setMarcaciones(response.data);
    } catch (err) {
      console.error("Error al obtener marcaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMarcaciones();
    const intervalo = setInterval(cargarMarcaciones, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const hoy = new Date();
  const diaHoy = hoy.toLocaleDateString("es-CO", { weekday: "long" });
  const fechaHoy = hoy.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const marcacionesHoy = marcaciones.filter((m) => {
    const fecha = new Date(m.fechaHora);
    return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth() && fecha.getDate() === hoy.getDate();
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Registro de Marcaciones</h1>
          <p className="text-gray-400 mt-2 text-lg">Entradas y salidas en tiempo real</p>
          <p className="mt-3 text-lg font-semibold capitalize text-brand-green">{diaHoy}, {fechaHoy}</p>
        </div>
        <Button className="bg-white/10 text-white font-medium border border-white/10 hover:bg-white/20 backdrop-blur-md" onPress={cargarMarcaciones}>
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Sincronizar
        </Button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Empleado</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Documento</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Hora</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Tipo</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {marcacionesHoy.map((m) => {
                const fecha = new Date(m.fechaHora);
                return (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{m.empleado?.nombre || "Sin empleado"}</td>
                    <td className="p-4 text-gray-400 font-mono">{m.empleado?.documento || "-"}</td>
                    <td className="p-4 text-gray-300 font-mono">{fecha.toLocaleTimeString("es-CO")}</td>
                    <td className="p-4">
                      <Chip size="sm" variant="flat" className={m.tipo === "ENTRADA" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}>
                        {m.tipo}
                      </Chip>
                    </td>
                    <td className="p-4">
                      {m.minutosRetraso > 0 ? (
                        <span className="text-sm font-medium text-red-400">{m.minutosRetraso} min tarde</span>
                      ) : (
                        <span className="text-sm font-medium text-green-400">A tiempo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
