import { useState } from "react";
import { Card, CardHeader, CardBody, Input, Button } from "@heroui/react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Para mostrar un spinner en el botón

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Reemplaza por la URL de tu backend en Render
      const response = await fetch("https://control-de-asistencia-cq18.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      const data = await response.json();
      
      // Guardar el JWT en el almacenamiento del navegador
      localStorage.setItem("token", data.token);
      
      // Avisar a App.jsx que ya podemos entrar
      onLogin(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center pb-0 pt-6 px-4">
          <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
          <p className="text-default-500 text-sm mt-1">
            Panel de Control de Asistencia
          </p>
        </CardHeader>
        
        <CardBody className="overflow-hidden p-6">
          {error && (
            <div className="bg-danger-50 text-danger p-3 rounded-medium mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              isRequired
              label="Usuario"
              placeholder="Ej. admin"
              variant="bordered"
              value={username}
              onValueChange={setUsername}
            />
            
            <Input
              isRequired
              type="password"
              label="Contraseña"
              placeholder="********"
              variant="bordered"
              value={password}
              onValueChange={setPassword}
            />

            <Button 
              type="submit" 
              color="primary" 
              isLoading={isLoading}
              className="mt-2"
            >
              Entrar
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default LoginPage;