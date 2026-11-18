import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, ClipboardCheck, Clock, LogOut
} from "lucide-react";

const menu = [
  { name: "Inicio", path: "/", icon: LayoutDashboard },
  { name: "Empleados", path: "/empleados", icon: Users },
  { name: "Tarjetas", path: "/tarjetas", icon: CreditCard },
  { name: "Marcaciones", path: "/marcaciones", icon: ClipboardCheck },
  { name: "Horarios", path: "/horarios", icon: Clock },
];

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex">
      <aside className="glass-panel w-72 fixed h-screen flex flex-col z-50 rounded-none md:rounded-r-3xl border-l-0 border-t-0 border-b-0">
        
        {/* 1. LOGO Y TÍTULO */}
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <img src="/logo.png" alt="El Entonador Ferretero" className="w-14 h-14 object-contain bg-white rounded-xl p-1.5 shadow-xl" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">El Entonador</h1>
            <p className="text-xs font-semibold text-brand-green tracking-widest uppercase mt-1">Ferretero</p>
          </div>
        </div>

        {/* 2. INDICADOR DE SISTEMA EN LÍNEA */}
        <div className="mx-5 mt-4 mb-2 p-3 bg-brand-green rounded-xl shadow-lg shadow-brand-green/50 flex items-center justify-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </div>
          <span className="text-xs font-bold text-white tracking-wider">SISTEMA EN LÍNEA</span>
        </div>

        {/* 3. MENÚ DE NAVEGACIÓN */}
        <nav className="p-5 flex flex-col gap-2 flex-1 mt-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Módulos</p>
          {menu.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path} to={path} end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/40 font-medium scale-[1.02]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
                }`
              }
            >
              <Icon size={22} />
              <span className="text-base">{name}</span>
            </NavLink>
          ))}
        </nav>

        {/* 4. BOTÓN CERRAR SESIÓN */}
        <div className="p-5 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="ml-72 flex-1 p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
