import { useState } from "react";
import { Button } from "@heroui/react";
import { User, Lock, LogIn, AlertCircle } from "lucide-react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://control-de-asistencia-cq18.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      const data = await response.json();

      // GUARDAMOS EN sessionStorage
      sessionStorage.setItem("token", data.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-blue/30 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-2xl mb-4 transform hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="El Entonador Ferretero" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center">El Entonador Ferretero</h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">Portal de Asistencia Corporativa</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. admin"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/20 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/20 transition-all"
              />
            </div>
          </div>

          <Button
            type="submit" isLoading={isLoading}
            className="w-full mt-2 bg-brand-green hover:bg-green-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-brand-green/20 transition-all duration-300 text-lg"
          >
            {!isLoading && <LogIn size={20} className="mr-2" />}
            {isLoading ? "Verificando..." : "Ingresar al Sistema"}
          </Button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-8 relative z-10">
          © {new Date().getFullYear()} El Entonador Ferretero.<br/> Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
