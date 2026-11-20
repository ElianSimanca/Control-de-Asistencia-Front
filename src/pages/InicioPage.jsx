import { useEffect, useState } from "react";
import api from "../api/axios";
import { Users, UserCheck, UserX, Clock, ClipboardCheck, LogIn, LogOut } from "lucide-react";

export default function InicioPage() {
  const [empleados, setEmpleados] = useState([]);
  const [marcaciones, setMarcaciones] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const hoy = new Date();
  const diaHoy = hoy.toLocaleDateString("es-CO", { weekday: "long" });
  const fechaHoy = hoy.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const marcacionesHoy = marcaciones.filter((m) => {
    const fecha = new Date(m.fechaHora);
    return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth() && fecha.getDate() === hoy.getDate();
  });

  const empleadosActivos = empleados.filter((e) => e.activo);
  const empleadosPresentes = new Set(marcacionesHoy.filter((m) => m.tipo === "ENTRADA").map((m) => m.empleado?.id).filter(Boolean));
  const presentes = empleadosPresentes.size;
  const ausentes = Math.max(empleadosActivos.length - presentes, 0);
  const retrasos = marcacionesHoy.filter((m) => m.minutosRetraso > 0).length;
  const ultimasMarcaciones = [...marcacionesHoy].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).slice(0, 8);

  const kpis = [
    { title: "Empleados Activos", value: empleadosActivos.length, icon: <Users size={28} className="text-brand-blue" />, bg: "bg-brand-blue/10" },
    { title: "Presentes", value: presentes, icon: <UserCheck size={28} className="text-brand-green" />, bg: "bg-brand-green/10" },
    { title: "Ausentes", value: ausentes, icon: <UserX size={28} className="text-brand-red" />, bg: "bg-brand-red/10" },
    { title: "Retrasos", value: retrasos, icon: <Clock size={28} className="text-brand-yellow" />, bg: "bg-brand-yellow/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-lg">Resumen del control de asistencia</p>
        <div className="glass-panel px-4 py-2 mt-4 inline-flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
          <p className="text-sm font-medium text-gray-300 capitalize">{diaHoy}, <span className="text-white">{fechaHoy}</span></p>
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
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">{kpi
