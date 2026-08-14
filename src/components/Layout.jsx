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
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold">
            Asistencia
          </h1>
          <p className="text-sm text-gray-500">
            Sistema de control
          </p>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {menu.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
            >
              <Icon size={20} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}