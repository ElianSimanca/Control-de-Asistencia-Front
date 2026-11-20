import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "@heroui/react";
import { RefreshCw, Loader2, PlusCircle } from "lucide-react";

export default function MarcacionesPage() {
  const [marcaciones, setMarcaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [tarjetas, setTarjetas] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empleadoId, setEmpleadoId] = useState("");
  const [tipo, setTipo] = useState("ENTRADA");
  const [fechaHora, setFechaHora] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [resMarcaciones, resEmpleados, resTarjetas] = await Promise.all([
        api.get("/marcaciones"),
        api.get("/empleados"),
        api.get("/cards").catch(() => ({ data: [] }))
      ]);
      setMarcaciones(resMarcaciones.data);
      setEmpleados(resEmpleados.data);
      setTarjetas(resTarjetas.data);
    } catch (err) {
      console.error("Error al obtener datos:", err);
      toast.danger("Error de conexión", { description: "No se pudieron cargar los datos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const hoy = new Date();
  const diaHoy = hoy.toLocaleDateString("es-CO", { weekday: "long" });
  const fechaHoy = hoy.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const marcacionesHoy = marcaciones.filter((m) => {
    const fecha = new Date(m.fechaHora);
    return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth() && fecha.getDate() === hoy.getDate();
  });

  const handleSincronizar = () => {
    cargarDatos();
    toast.default("Sincronizando", { description: "Consultando los datos más recientes..." });
  };

  // Abrir modal con la fecha/hora actual por defecto
  const abrirModal = () => {
    const ahora = new Date();
    // Ajuste para que el input datetime-local muestre la hora correcta
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    setFechaHora(ahora.toISOString().slice(0, 16)); 
    setIsModalOpen(true);
  };

  const handleMarcacionManual = async (e) => {
    e.preventDefault();
    if (!empleadoId) {
      toast.warning("Atención", { description: "Selecciona un empleado." });
      return;
    }

    try {
      setGuardando(true);
      
      const tarjetaDelEmpleado = tarjetas.find(t => {
          const idDelEmpleadoEnTarjeta = t.empleado?.id || t.empleadoId; 
          return idDelEmpleadoEnTarjeta === Number(empleadoId);
      });

      if (!tarjetaDelEmpleado) {
        toast.danger("Error", { description: "Este empleado no tiene una tarjeta asignada." });
        setGuardando(false);
        return;
      }

      // Convertimos la fecha local del input a formato ISO
      const fechaIso = new Date(fechaHora).toISOString();

      await api.post("/marcaciones", {
        uid: tarjetaDelEmpleado.uid,
        tipo: tipo,
        fechaHora: fechaIso
      });

      toast.success("Marcación guardada", { description: `Se registró ${tipo} correctamente.` });
      setIsModalOpen(false);
      setEmpleadoId("");
      await cargarDatos(); 
    } catch (err) {
      console.error("Error al guardar marcación manual:", err);
      toast.danger("Error", { description: err.response?.data?.message || "No se pudo registrar la marcación." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Registro de Marcaciones</h1>
          <p className="text-gray-400 mt-2 text-lg">Entradas y salidas en tiempo real</p>
          <p className="mt-3 text-lg font-semibold capitalize text-brand-green">{diaHoy}, {fechaHoy}</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleSincronizar} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all font-medium">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Sincronizar
          </button>
          
          <button onClick={abrirModal} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-brand-blue/20 transition-all">
            <PlusCircle size={18} /> Marcación Manual
          </button>
        </div>
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
              {marcacionesHoy.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-brand-green" size={32} />
                        <p className="text-gray-300 font-medium">Consultando el servidor...</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">No hay marcaciones registradas hoy.</p>
                    )}
                  </td>
                </tr>
              )}
              {marcacionesHoy.map((m) => {
                const fecha = new Date(m.fechaHora);
                return (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{m.empleado?.nombre || "Sin empleado"}</td>
                    <td className="p-4 text-gray-400 font-mono">{m.empleado?.documento || "-"}</td>
                    <td className="p-4 text-gray-300 font-mono">{fecha.toLocaleTimeString("es-CO")}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.tipo === "ENTRADA" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="p-4">
                      {m.minutosRetraso > 0 ? <span className="text-sm font-medium text-red-400">{m.minutosRetraso} min tarde</span> : <span className="text-sm font-medium text-green-400">A tiempo</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA MARCACIÓN MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="glass-panel bg-[#0B1120]/95 border border-white/10 w-full max-w-md relative z-10 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Registrar Marcación Manual</h2>
            
            <form onSubmit={handleMarcacionManual} className="flex flex-col gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Empleado *</label>
                <select required value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50">
                  <option value="" className="bg-[#0B1120]">Selecciona un empleado</option>
                  {empleados.filter(e => e.activo).map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-[#0B1120]">
                      {emp.nombre} - {emp.documento}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Marcación *</label>
                <select required value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50">
                  <option value="ENTRADA" className="bg-[#0B1120]">ENTRADA</option>
                  <option value="SALIDA" className="bg-[#0B1120]">SALIDA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha y Hora *</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={fechaHora} 
                  onChange={(e) => setFechaHora(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50 [color-scheme:dark]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-brand-blue/20 transition-all text-sm disabled:opacity-50">
                  {guardando ? "Guardando..." : "Guardar Marcación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
