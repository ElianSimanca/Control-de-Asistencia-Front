import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import EmpleadosPage from "./pages/EmpleadosPage";
import TarjetasPage from "./pages/TarjetasPage";
import MarcacionesPage from "./pages/MarcacionesPage";
import HorariosPage from "./pages/HorariosPage";
import InicioPage from "./pages/InicioPage";

import LoginPage from "./pages/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<InicioPage />} />
        <Route
          path="/empleados"
          element={<EmpleadosPage />}
        />
        <Route
          path="/tarjetas"
          element={<TarjetasPage />}
        />
        <Route
          path="/marcaciones"
          element={<MarcacionesPage />}
        />
        <Route
          path="/horarios"
          element={<HorariosPage />}
        />
      </Route>
    </Routes>
  );
}

export default App;