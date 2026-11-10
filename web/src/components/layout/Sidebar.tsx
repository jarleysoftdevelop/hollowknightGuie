
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Map,
  Compass,
  Route,
  Gem,
  Package,
  Swords,
  Users,
  Skull,
  BookOpen,
  ClipboardCheck,
  Trophy,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

const sections = [
  {
    title: "EXPLORACIÓN",
    items: [
      { label: "Mapa interactivo", href: "/games/hollow-knight/map", icon: Map },
      { label: "Regiones", href: "/games/hollow-knight/regions", icon: Compass },
      { label: "Ruta al 112%", href: "/games/hollow-knight/route", icon: Route },
    ],
  },
  {
    title: "ENCICLOPEDIA",
    items: [
      { label: "Amuletos", href: "/games/hollow-knight/charms", icon: Gem },
      { label: "Objetos y reliquias", href: "/games/hollow-knight/items", icon: Package },
      { label: "Habilidades y armas", href: "/games/hollow-knight/abilities", icon: Swords },
      { label: "Personajes y NPC", href: "/games/hollow-knight/characters", icon: Users },
      { label: "Enemigos y jefes", href: "/games/hollow-knight/enemies", icon: Skull },
      { label: "Lore e historia", href: "/games/hollow-knight/lore", icon: BookOpen },
    ],
  },
  {
    title: "MI AVENTURA",
    items: [
      { label: "Mi progreso", href: "/games/hollow-knight/progress", icon: ClipboardCheck },
      { label: "Logros", href: "/games/hollow-knight/achievements", icon: Trophy },
      { label: "Favoritos", href: "/games/hollow-knight/favorites", icon: Bookmark },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({
  onClose,
  collapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <aside
      className={`flex h-full flex-col border-r border-[#354654] bg-[#101820] text-white transition-all duration-300 ${
        collapsed ? "w-[76px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div className="flex h-24 items-center justify-center border-b border-[#354654] px-4">
        <Link href="/games/hollow-knight" onClick={onClose}>
          {collapsed ? (
            <span className="text-3xl text-[#C5D8E4]">◈</span>
          ) : (
            <img
              src="/images/interactive.png"
              alt="Hollow Knight Guide"
              className="w-full max-w-[220px]"
            />
          )}
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <Link
            href="/games/hollow-knight"
            onClick={onClose}
            className={`mb-5 flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
              pathname === "/games/hollow-knight"
                ? "bg-[#293B49] text-white"
                : "text-slate-400 hover:bg-[#1D2B36] hover:text-white"
            }`}
          >
            <BookOpen size={19} />
            Inicio del videojuego
          </Link>
        )}

        {sections.map((section) => (
          <div key={section.title} className="mb-7">
            {!collapsed && (
              <h3 className="mb-3 px-3 text-[10px] font-semibold tracking-[0.2em] text-[#7890A2]">
                {section.title}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "border border-[#526D80] bg-[#293B49] text-white shadow-[inset_3px_0_0_#C5D8E4]"
                        : "text-slate-400 hover:bg-[#1D2B36] hover:text-white"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={active ? "text-[#D4E5F0]" : "text-[#8FA5B5]"}
                    />

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Perfil */}
      <div className="border-t border-[#354654] p-3">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#1A2731] p-3">
          <UserRound size={21} className="shrink-0 text-[#B9D0E0]" />

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.displayName || "Viajero"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-950/40 hover:text-red-300"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut size={19} />
          {!collapsed && "Cerrar sesión"}
        </button>

        {onToggle && (
          <button
            onClick={onToggle}
            className="mt-2 flex w-full items-center justify-center rounded-lg py-2 text-slate-400 hover:bg-[#1D2B36] hover:text-white"
            title={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            {collapsed ? (
              <ChevronRight size={19} />
            ) : (
              <ChevronLeft size={19} />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
