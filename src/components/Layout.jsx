import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  Clock,
} from "lucide-react";

const menu = [
  {
    name: "Inicio",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Empleados",
    path: "/empleados",
    icon: Users,
  },
  {
    name: "Tarjetas",
    path: "/tarjetas",
    icon: CreditCard,
  },
  {
    name: "Marcaciones",
    path: "/marcaciones",
    icon: ClipboardCheck,
  },
  {
    name: "Horarios",
    path: "/horarios",
    icon: Clock,
  },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* BARRA LATERAL CON EFECTO CRISTAL */}
      <aside className="glass-panel w-64 fixed h-screen flex flex-col border-r border-white/10 z-50 rounded-none md:rounded-r-2xl">
        
        {/* LOGO Y TÍTULO */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          {/* Asegúrate de tener logo.png en la carpeta public */}
          <img
            src="/logo.png"
            alt="El Entonador Ferretero"
            className="w-12 h-12 object-contain bg-white rounded-full p-1 shadow-lg"
          />
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              El Entonador
            </h1>
            <p className="text-xs text-gray-400">
              Ferretero
            </p>
          </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="p-4 flex flex-col gap-2 flex-1">
          {menu.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30 font-semibold"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
