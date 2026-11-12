
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/games/hollow-knight");
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080E14] text-white">
      <div className="text-center">
        <div className="mb-4 text-3xl font-semibold tracking-[0.3em]">
          GAMEATLAS
        </div>

        <p className="text-sm text-slate-400">
          Explorando los archivos de Hallownest...
        </p>
      </div>
    </main>
  );
}
