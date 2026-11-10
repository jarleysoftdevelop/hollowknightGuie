
"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AuthTestPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p>Verificando sesión...</p>;
  }

  return (
    <main className="min-h-screen bg-[#101820] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-slate-600 rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6">
          HollowKnightGuide
        </h1>

        {user ? (
          <>
            <p className="text-slate-300 mb-4">
              Sesión iniciada correctamente
            </p>

            <p className="text-sm text-slate-400 mb-6">
              Usuario: {user.email}
            </p>

            <button
              onClick={logout}
              className="w-full rounded-lg bg-slate-200 text-slate-900 p-3"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <p className="text-slate-300">
            No existe una sesión activa.
          </p>
        )}
      </div>
    </main>
  );
}
