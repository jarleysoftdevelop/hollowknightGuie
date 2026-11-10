
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { updateProfile } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    
    try {
      // 1. Crear cuenta en Firebase Authentication
      const user = await register(email.trim(), password);
    
      // 2. Guardar nombre del jugador en Firebase Auth
      await updateProfile(user, {
        displayName: username.trim(),
      });
    
      // 3. Obtener ID Token
      const token = await user.getIdToken();
    
      // 4. Solicitar creación del perfil a NestJS
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: username.trim(),
          }),
        }
      );
    
      const result = await response.json();
    
      if (!response.ok) {
        throw new Error(
          result.message || "No fue posible crear el perfil."
        );
      }
    
      console.log("Perfil de jugador:", result);
    
      // 5. Ir al Dashboard
      router.replace("/dashboard");
    
    } catch (err: unknown) {
      console.error("Error en registro:", err);
    
      const code = (err as { code?: string })?.code;
    
      const message = (err as { message?: string })?.message;
    
      const messages: Record<string, string> = {
        "auth/email-already-in-use":
          "Este correo ya tiene una cuenta registrada.",
        "auth/invalid-email":
          "El correo electrónico no es válido.",
        "auth/weak-password":
          "La contraseña es demasiado débil.",
        "auth/network-request-failed":
          "No se pudo conectar con el servidor.",
      };
    
      setError(
        messages[code ?? ""] ??
        message ??
        "No fue posible completar el registro."
      );
    
    } finally {
      setLoading(false);
    }
    
    
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080E14] px-5 py-12 text-white">

      {/* Fondo de Hallownest */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/background.png')",
          opacity: 0.38,
        }}
      />

      {/* Capa oscura */}
      <div className="pointer-events-none absolute inset-0 bg-[#080E14]/65" />

      {/* Iluminación ambiental */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(65,105,140,0.18),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logotipo */}
        <div className="mb-7 flex justify-center">
          <img
            src="/images/interactive.png"
            alt="Hollow Knight Interactive Guide"
            className="h-auto w-full max-w-[440px] object-contain"
            draggable={false}
          />
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-[#354654] bg-[#121B24]/95 p-8 shadow-2xl">

          <h1 className="text-center text-2xl font-semibold">
            Únete a Hallownest
          </h1>

          <p className="mb-7 mt-2 text-center text-sm text-slate-400">
            Comienza tu propia aventura.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Nombre de jugador
              </label>

              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="¿Cómo te llamaremos?"
                className="w-full rounded-lg border border-[#435565] bg-[#0B131B] px-4 py-3 text-white outline-none transition focus:border-[#A9C5D8]"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Correo electrónico
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-[#435565] bg-[#0B131B] px-4 py-3 text-white outline-none transition focus:border-[#A9C5D8]"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Contraseña
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-[#435565] bg-[#0B131B] px-4 py-3 text-white outline-none transition focus:border-[#A9C5D8]"
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Confirmar contraseña
              </label>

              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full rounded-lg border border-[#435565] bg-[#0B131B] px-4 py-3 text-white outline-none transition focus:border-[#A9C5D8]"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#C4D7E4] py-3 font-semibold tracking-widest text-[#111923] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "CREANDO CUENTA..." : "COMENZAR AVENTURA"}
            </button>

          </form>

          <div className="my-6 border-t border-[#354654]" />

          <p className="text-center text-sm text-slate-400">
            ¿Ya tienes una cuenta?
          </p>

          <Link
            href="/login"
            className="mt-3 block text-center font-medium text-[#B9D0E0] hover:text-white"
          >
            Iniciar sesión
          </Link>

        </div>

        <p className="mt-6 text-center text-xs tracking-wider text-slate-600">
          TU HISTORIA EN HALLOWNEST COMIENZA AQUÍ
        </p>

      </div>
    </main>
  );
}
