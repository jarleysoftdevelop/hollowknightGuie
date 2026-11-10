
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;

      const messages: Record<string, string> = {
        "auth/invalid-credential":
          "Correo o contraseña incorrectos.",
        "auth/invalid-email":
          "El correo electrónico no es válido.",
        "auth/too-many-requests":
          "Demasiados intentos. Inténtalo más tarde.",
        "auth/network-request-failed":
          "No se pudo conectar con el servidor.",
      };

      setError(
        messages[code ?? ""] ??
        "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1117] px-5 py-12 text-white">

      {/* Ambientación */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
            backgroundImage: "url('/images/background.png')",
            opacity: 0.38,
        }}
        />

        <div className="pointer-events-none absolute inset-0 bg-[#080E14]/65" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(65,105,140,0.18),transparent_70%)]" />

      <div className="relative w-full max-w-md">

        {/* Identidad */}
        
        {/* Identidad visual */}
        <div className="mb-9 flex justify-center">
        <img
            src="/images/interactive.png"
            alt="Hollow Knight Interactive Guide"
            className="h-auto w-full max-w-[580px] object-contain"
            draggable={false}
        />
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-[#354654] bg-[#121B24]/95 p-8 shadow-2xl">

          <h2 className="text-center text-2xl font-semibold">
            Bienvenido de vuelta
          </h2>

          <p className="mb-8 mt-2 text-center text-sm text-slate-400">
            Tu viaje por Hallownest continúa.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

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

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Contraseña
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full rounded-lg border border-[#435565] bg-[#0B131B] px-4 py-3 text-white outline-none transition focus:border-[#A9C5D8]"
              />
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-[#A9C5D8] hover:text-white"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#C4D7E4] py-3 font-semibold tracking-widest text-[#111923] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "ENTRANDO..." : "ENTRAR A HALLownest"}
            </button>

          </form>

          <div className="my-7 border-t border-[#354654]" />

          <p className="text-center text-sm text-slate-400">
            ¿Todavía no tienes una cuenta?
          </p>

          <Link
            href="/register"
            className="mt-3 block text-center font-medium text-[#B9D0E0] hover:text-white"
          >
            Crear una cuenta
          </Link>

        </div>

        <p className="mt-7 text-center text-xs tracking-wider text-slate-600">
          UNA GUÍA INDEPENDIENTE PARA EXPLORAR HALLOWNEST
        </p>

      </div>
    </main>
  );
}
