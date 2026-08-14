import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import EmpleadosPage from "./pages/EmpleadosPage";
import TarjetasPage from "./pages/TarjetasPage";
import MarcacionesPage from "./pages/MarcacionesPage";
import HorariosPage from "./pages/HorariosPage";

function InicioPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Panel de control
      </h1>

      <p className="text-gray-500 mt-2">
        Selecciona una sección del menú.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<InicioPage />} />
        <Route path="/empleados" element={<EmpleadosPage />} />
        <Route path="/tarjetas" element={<TarjetasPage />} />
        <Route path="/marcaciones" element={<MarcacionesPage />} />
        <Route path="/horarios" element={<HorariosPage />} />
      </Route>
    </Routes>
  );
}

export default App;