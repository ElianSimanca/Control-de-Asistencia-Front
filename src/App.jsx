import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toast } from "@heroui/react"; // <-- IMPORTANTE
import Layout from "./components/Layout";

import EmpleadosPage from "./pages/EmpleadosPage";
import TarjetasPage from "./pages/TarjetasPage";
import MarcacionesPage from "./pages/MarcacionesPage";
import HorariosPage from "./pages/HorariosPage";
import InicioPage from "./pages/InicioPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) return null;

  return (
    <>
      <Toast.Provider placement="top-right" />
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<InicioPage />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
            <Route path="/tarjetas" element={<TarjetasPage />} />
            <Route path="/marcaciones" element={<MarcacionesPage />} />
            <Route path="/horarios" element={<HorariosPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;
