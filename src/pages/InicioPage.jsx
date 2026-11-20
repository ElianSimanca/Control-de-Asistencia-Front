import { useEffect, useState } from "react";
import api from "../api/axios";
import { Users, UserCheck, UserX, Clock, ClipboardCheck, LogIn, LogOut, Download } from "lucide-react";
import { toast } from "@heroui/react";
import * as XLSX from "xlsx";

export default function InicioPage() {
  const [empleados, setEmpleados] = useState([]);
  const [marcaciones, setMarcaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el indicador de conexión real
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Filtros de fecha para exportar
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarDatos = async () => {
    try {
      const [resEmpleados, resMarcaciones] = await Promise.all([
        api.get("/empleados"),
        api.get("/marcaciones"),
      ]);
      setEmpleados(resEmpleados.data);
      setMarcaciones(resMarcaciones.data);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si el backend está despierto
  const verificarConexion = async () => {
    try {
      await api.get("/health");
      setIsBackendOnline(true);
    } catch (err) {
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    verificarConexion(); // Verificamos al cargar

    const intervaloDatos = setInterval(cargarDatos, 3000);
    const intervaloPing = setInterval(verificarConexion, 10000); // Verifica cada 10 segundos

    return () => {
      clearInterval(intervaloDatos);
      clearInterval(intervaloPing);
    };
  }, []);

  const hoy = new Date();
  const diaHoy = hoy.toLocaleDateString("es-CO", { weekday: "long" });
  const fechaHoy = hoy.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const empleadosActivos = empleados.filter((e) => e.activo);
  const marcacionesHoy = marcaciones.filter((m) => {
    const fecha = new Date(m.fechaHora);
    return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth() && fecha.getDate() === hoy.getDate();
  });

  const empleadosPresentes = new Set(marcacionesHoy.filter((m) => m.tipo === "ENTRADA").map((m) => m.empleado?.id).filter(Boolean));
  const presentes = empleadosPresentes.size;
  const ausentes = Math.max(empleadosActivos.length - presentes, 0);
  const retrasos = marcacionesHoy.filter((m) => m.minutosRetraso > 0).length;
  
  const ultimasMarcaciones = [...marcaciones].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).slice(0, 8);

  const kpis = [
    { title: "Empleados Activos", value: empleadosActivos.length, icon: <Users size={28} className="text-brand-blue" />, bg: "bg-brand-blue/10" },
    { title: "Presentes", value: presentes, icon: <UserCheck size={28} className="text-brand-green" />, bg: "bg-brand-green/10" },
    { title: "Ausentes", value: ausentes, icon: <UserX size={28} className="text-brand-red" />, bg: "bg-brand-red/10" },
    { title: "Retrasos", value: retrasos, icon: <Clock size={28} className="text-brand-yellow" />, bg: "bg-brand-yellow/10" },
  ];

  // --- FUNCIÓN PARA EXPORTAR A EXCEL ---
  const handleExportar = () => {
    let datosParaExportar = marcaciones;

    if (fechaInicio || fechaFin) {
      datosParaExportar = marcaciones.filter(m => {
        const fechaM = new Date(m.fechaHora).getTime();
        const inicio = fechaInicio ? new Date(fechaInicio + "T00:00:00").getTime() : 0;
        const fin = fechaFin ? new Date(fechaFin + "T23:59:59").getTime() : Infinity;
        return fechaM >= inicio && fechaM <= fin;
      });
    }

    if (datosParaExportar.length === 0) {
      toast.warning("Sin datos", { description: "No hay marcaciones en ese rango de fechas." });
      return;
    }

    const datosExcel = datosParaExportar.map(m => {
      const fecha = new Date(m.fechaHora);
      return {
        "Empleado": m.empleado?.nombre || "Sin empleado",
        "Documento": m.empleado?.documento || "-",
        "Fecha": fecha.toLocaleDateString("es-CO"),
        "Hora": fecha.toLocaleTimeString("es-CO"),
        "Tipo": m.tipo,
        "Estado": m.minutosRetraso > 0 ? `${m.minutosRetraso} min tarde` : "A tiempo"
      };
    });

    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Marcaciones");
    
    XLSX.writeFile(libro, `Reporte_Asistencia_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Excel generado", { description: "El archivo se ha descargado." });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-gray-400 mt-1 text-lg">Resumen del control de asistencia</p>
            
            {/* INDICADOR DE CONEXIÓN REAL */}
            <div className={`glass-panel px-4 py-2 mt-4 inline-flex items-center gap-2 border ${isBackendOnline ? 'border-brand-green/20' : 'border-red-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-brand-green animate-pulse' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium text-gray-300 capitalize">
                {isBackendOnline ? 'Sistema en línea' : 'Sistema fuera de línea'}
              </p>
            </div>
          </div>
          
          {/* FILTROS DE EXPORTACIÓN */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Desde</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-blue/50 [color-scheme:dark]" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Hasta</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-blue/50 [color-scheme:dark]" />
            </div>
            <button onClick={handleExportar} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-600/20 transition-all h-[42px]">
              <Download size={18} /> Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl ${kpi.bg} group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-400">{kpi.title}</p>
                <p className="text-4xl font-bold text-white mt-2">{loading ? <span className="skeleton inline-block w-10 h-10"></span> : kpi.value}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 flex items-center gap-4"><div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400"><ClipboardCheck size={28} /></div><div><p className="text-sm font-medium text-gray-400">Marcaciones Hoy</p><p className="text-2xl font-bold text-white">{loading ? <span className="skeleton inline-block w-8 h-8"></span> : marcacionesHoy.length}</p></div></div>
        <div className="glass-panel p-6 flex items-center gap-4"><div className="p-4 rounded-2xl bg-green-500/10 text-green-400"><LogIn size={28} /></div><div><p className="text-sm font-medium text-gray-400">Entradas (Hoy)</p><p className="text-2xl font-bold text-white">{loading ? <span className="skeleton inline-block w-8 h-8"></span> : marcacionesHoy.filter((m) => m.tipo === "ENTRADA").length}</p></div></div>
        <div className="glass-panel p-6 flex items-center gap-4"><div className="p-4 rounded-2xl bg-orange-500/10 text-orange-400"><LogOut size={28} /></div><div><p className="text-sm font-medium text-gray-400">Salidas (Hoy)</p><p className="text-2xl font-bold text-white">{loading ? <span className="skeleton inline-block w-8 h-8"></span> : marcacionesHoy.filter((m) => m.tipo === "SALIDA").length}</p></div></div>
      </div>

      <div className="glass-panel">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-white">Últimas Marcaciones</h2><p className="text-sm text-gray-400 mt-1">Historial general de actividad</p></div>
          <span className="px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full animate-pulse">En vivo</span>
        </div>
        <div className="p-2">
          {loading ? (
            <div className="p-6 space-y-4"><div className="skeleton h-12 w-full"></div><div className="skeleton h-12 w-full"></div></div>
          ) : ultimasMarcaciones.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay marcaciones registradas.</div>
          ) : (
            <div className="flex flex-col">
              {ultimasMarcaciones.map((m) => {
                const fecha = new Date(m.fechaHora);
                return (
                  <div key={m.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors m-1">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/10">{m.empleado?.nombre?.charAt(0) || "?"}</div>
                      <div><p className="font-semibold text-white">{m.empleado?.nombre || "Sin empleado"}</p><p className="text-sm text-gray-400">Doc: {m.empleado?.documento || "-"}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono text-gray-300 bg-black/20 px-3 py-1 rounded-md text-sm border border-white/5">{fecha.toLocaleTimeString("es-CO")}</p>
                        <p className="text-xs text-gray-500 mt-1">{fecha.toLocaleDateString("es-CO")}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.tipo === "ENTRADA" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}`}>{m.tipo}</span>
                      {m.minutosRetraso > 0 && <span className="px-2 py-1 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">{m.minutosRetraso} min</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
