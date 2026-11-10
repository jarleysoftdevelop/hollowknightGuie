
"use client";

import { useState, type ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";

import {
  Menu,
  X,
} from "lucide-react";

interface HollowKnightLayoutProps {
  children: ReactNode;
}

export default function HollowKnightLayout({
  children,
}: HollowKnightLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080E14] text-white">

      {/* Menú móvil */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-[#354654] bg-[#101820] px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-[#C5D8E4] hover:bg-[#263744]"
          aria-label="Abrir navegación"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <span className="ml-4 text-sm font-semibold tracking-widest">
          HOLLOW KNIGHT
        </span>
      </header>

      {/* Sidebar escritorio */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Cerrar navegación"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/70"
          />

          <div className="relative h-full w-[280px]">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Contenido */}
      <main
        className={`min-h-screen pt-16 transition-all duration-300 lg:pt-0 ${
          collapsed ? "lg:ml-[76px]" : "lg:ml-[280px]"
        }`}
      >
        {children}
      </main>

    </div>
  );
}
