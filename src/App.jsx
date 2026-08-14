import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import EmpleadosPage from "./pages/EmpleadosPage";
import TarjetasPage from "./pages/TarjetasPage";
import MarcacionesPage from "./pages/MarcacionesPage";
import HorariosPage from "./pages/HorariosPage";

// 1. Importamos el nuevo componente de Login que vamos a crear
import LoginPage from "./pages/LoginPage"; 

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
  // 2. Estado para saber si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 3. Revisar si ya existe un token en el navegador al abrir la página
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // 4. Si no está autenticado, devolvemos SOLO la pantalla de Login.
  // Le pasamos una función para cambiar el estado cuando inicie sesión exitosamente.
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  // 5. Si está autenticado, renderizamos tus rutas normales
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