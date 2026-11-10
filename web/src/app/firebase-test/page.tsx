
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

export default function FirebaseTest() {
  const [status, setStatus] = useState("Conectando...");

  useEffect(() => {
    try {
      if (auth && db) {
        setStatus("Firebase inicializado correctamente");
      }
    } catch (error) {
      console.error(error);
      setStatus("Error al inicializar Firebase");
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl border p-8 text-center">
        <h1 className="text-2xl font-bold">
          HollowKnightGuide
        </h1>

        <p className="mt-4">{status}</p>
      </div>
    </main>
  );
}
