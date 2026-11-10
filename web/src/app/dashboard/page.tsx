
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#080E14] flex items-center justify-center text-white">
        <p className="text-slate-400">
          Explorando los archivos de Hallownest...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080E14] text-white">

      <header className="border-b border-[#354654] bg-[#121B24] px-8 py-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-widest">
          HOLLOWKNIGHTGUIDE
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            {user.displayName || user.email}
          </span>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-[#435565] px-4 py-2 text-sm hover:bg-[#263440]"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">

        <p className="text-sm tracking-[0.3em] text-[#A9C5D8]">
          BIENVENIDO A HALLOWNEST
        </p>

        <h2 className="mt-4 text-4xl font-semibold">
          Tu aventura comienza aquí.
        </h2>

        <p className="mt-4 max-w-xl text-slate-400">
          Explora los secretos del reino, descubre sus reliquias
          y completa cada desafío hasta alcanzar el 112%.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {[
            {
              title: "Atlas de Hallownest",
              description: "Explora las regiones y descubre sus secretos.",
            },
            {
              title: "Enciclopedia",
              description: "Conoce objetos, habilidades, enemigos y amuletos.",
            },
            {
              title: "Ruta al 112%",
              description: "Organiza tu progreso y completa cada desafío.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-[#354654] bg-[#121B24] p-6 transition hover:border-[#A9C5D8]"
            >
              <h3 className="text-xl font-semibold">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </article>
          ))}

        </div>

      </section>
    </main>
  );
}
