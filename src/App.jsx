import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toast } from "@heroui/react"; // <-- CAMBIO AQUÍ
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

  // El Toast.Provider se coloca una sola vez, envolviendo todo
  return (
    <Toast.Provider placement="top-right" />
    // ^^^ ESTO ES LO QUE CAMBIA
    // El resto del código sigue igual, pero sin el ToastProvider viejo.
  );
}

export default App;
