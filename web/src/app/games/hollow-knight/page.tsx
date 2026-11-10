
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Map,
    Gem,
    Package,
    Swords,
    Users,
    Skull,
    BookOpen,
    Route,
    Trophy,
    Compass,
    ChevronRight,
    Sparkles,
    LoaderCircle,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

interface GameProgress {
    progress: number;
    completion: number;
    achievements: string[];
    lastActivity: unknown;
}

interface ProfileResponse {
    success: boolean;
    profile: {
        username: string;
        email: string;
        games?: {
            "hollow-knight"?: GameProgress;
        };
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const sections = [
    {
        title: "Exploración",
        description: "Descubre cada rincón del reino.",
        items: [
            {
                title: "Mapa interactivo",
                description: "Explora Hallownest y localiza sus secretos.",
                href: "/games/hollow-knight/map",
                icon: Map,
            },
            {
                title: "Regiones",
                description: "Conoce todas las zonas del reino.",
                href: "/games/hollow-knight/regions",
                icon: Compass,
            },
        ],
    },
    {
        title: "Enciclopedia",
        description: "Todo lo que necesitas conocer.",
        items: [
            {
                title: "Amuletos",
                description: "Efectos, ubicaciones y combinaciones.",
                href: "/games/hollow-knight/charms",
                icon: Gem,
            },
            {
                title: "Objetos y reliquias",
                description: "Coleccionables y objetos importantes.",
                href: "/games/hollow-knight/items",
                icon: Package,
            },
            {
                title: "Habilidades y armas",
                description: "Mejoras, hechizos y movimientos.",
                href: "/games/hollow-knight/abilities",
                icon: Swords,
            },
            {
                title: "Personajes",
                description: "NPC, comerciantes y encuentros.",
                href: "/games/hollow-knight/characters",
                icon: Users,
            },
            {
                title: "Enemigos y jefes",
                description: "Conoce a tus adversarios.",
                href: "/games/hollow-knight/enemies",
                icon: Skull,
            },
            {
                title: "Lore e historia",
                description: "Descubre los secretos de Hallownest.",
                href: "/games/hollow-knight/lore",
                icon: BookOpen,
            },
        ],
    },
];

export default function HollowKnightPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [gameProgress, setGameProgress] =
        useState<GameProgress>({
            progress: 0,
            completion: 0,
            achievements: [],
            lastActivity: null,
        });

    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (loading || !user) return;

        let cancelled = false;

        const loadProfile = async () => {
            setProfileLoading(true);
            setProfileError("");

            try {
                const token = await user.getIdToken();

                const response = await fetch(
                    `${API_URL}/users/profile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("No fue posible consultar tu perfil.");
                }

                const result: ProfileResponse = await response.json();

                if (!cancelled) {
                    setGameProgress(
                        result.profile.games?.["hollow-knight"] ?? {
                            progress: 0,
                            completion: 0,
                            achievements: [],
                            lastActivity: null,
                        }
                    );
                }
            } catch (error) {
                console.error("Error cargando perfil:", error);

                if (!cancelled) {
                    setProfileError(
                        "No pudimos sincronizar tu progreso. Mostramos los valores iniciales."
                    );
                }
            } finally {
                if (!cancelled) {
                    setProfileLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [loading, user]);

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#080E14] text-slate-300">
                <LoaderCircle className="mr-3 animate-spin" />
                Explorando Hallownest...
            </div>
        );
    }

    const completion = Math.max(
        0,
        Math.min(112, gameProgress.completion)
    );

    const completionPercentage = (completion / 112) * 100;

    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-[#080E14]">

            {/* Fondo de Hallownest */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/background-menu.png')",
                }}
            />
            {/* Oscurecimiento general */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 bg-[#080E14]/80"
            />
            {/* Degradado ambiental */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#080E14]/35 via-[#080E14]/65 to-[#080E14]/90"
            />


            {/* HERO */}
            <section className="relative overflow-hidden border-b border-[#354654]">

                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(92,125,151,0.18),transparent_60%)]" />

                <div className="relative w-full px-6 py-16 sm:px-8 lg:px-10 2xl:px-14 lg:py-24">

                    <div className="max-w-3xl">

                        <div className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-[#A9C5D8]">
                            <Sparkles size={15} />
                            BIENVENIDO A HALLOWNEST
                        </div>

                        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                            El reino espera
                            <br />
                            <span className="text-[#A9C5D8]">
                                por ti.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
                            Hola, {user.displayName || "viajero"}.
                            Explora los secretos de Hallownest, descubre
                            sus reliquias y escribe tu propia historia.
                        </p>

                        <div className="mt-9 flex flex-wrap gap-3">

                            <Link
                                href="/games/hollow-knight/progress"
                                className="inline-flex items-center gap-2 rounded-lg bg-[#C4D7E4] px-6 py-3 text-sm font-semibold text-[#101820] transition hover:bg-white"
                            >
                                Continuar aventura
                                <ChevronRight size={17} />
                            </Link>

                            <Link
                                href="/games/hollow-knight/map"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#526777] px-6 py-3 text-sm font-medium text-[#D4E2EC] transition hover:bg-[#192936]"
                            >
                                <Map size={17} />
                                Explorar mapa
                            </Link>

                        </div>
                    </div>

                    <div className="pointer-events-none absolute -right-12 -top-20 hidden select-none text-[330px] font-serif text-white/[0.025] lg:block">
                        HK
                    </div>

                </div>
            </section>

            <div className="w-full space-y-14 px-6 py-12 sm:px-8 lg:px-10 2xl:px-14">

                {/* PROGRESO */}
                <section>

                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#7893A7]">
                                MI AVENTURA
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                Tu progreso
                            </h2>
                        </div>

                        <Link
                            href="/games/hollow-knight/progress"
                            className="hidden items-center gap-1 text-sm text-[#A9C5D8] hover:text-white sm:flex"
                        >
                            Ver detalles
                            <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">

                        <article className="rounded-xl border border-[#354654] bg-[#111B24] p-6 md:col-span-2">

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Progreso hacia el 112%
                                    </p>

                                    <p className="mt-2 text-4xl font-semibold text-white">
                                        {completion}
                                        <span className="ml-1 text-xl text-slate-500">
                                            / 112%
                                        </span>
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#263B49] p-4">
                                    <Trophy size={27} className="text-[#C4D7E4]" />
                                </div>
                            </div>

                            <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#293A47]">
                                <div
                                    className="h-full rounded-full bg-[#B8D0E0] transition-all duration-700"
                                    style={{
                                        width: `${completionPercentage}%`,
                                    }}
                                />
                            </div>

                            <div className="mt-3 flex justify-between text-xs text-slate-500">
                                <span>{completionPercentage.toFixed(1)}% del objetivo</span>
                                <span>Objetivo: 112%</span>
                            </div>

                        </article>

                        <article className="rounded-xl border border-[#354654] bg-[#111B24] p-6">

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Logros registrados
                                    </p>

                                    <p className="mt-3 text-4xl font-semibold text-white">
                                        {gameProgress.achievements.length}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#263B49] p-4">
                                    <Trophy size={27} className="text-[#C4D7E4]" />
                                </div>
                            </div>

                            <p className="mt-5 text-xs text-slate-500">
                                Descubrimientos guardados en tu aventura.
                            </p>

                        </article>

                    </div>

                    {profileLoading && (
                        <p className="mt-3 text-xs text-slate-500">
                            Sincronizando tu perfil...
                        </p>
                    )}

                    {profileError && (
                        <p role="status" className="mt-3 text-xs text-amber-400">
                            {profileError}
                        </p>
                    )}

                </section>

                {/* EXPLORACIÓN Y ENCICLOPEDIA */}
                {sections.map((section) => (

                    <section key={section.title}>

                        <div className="mb-6">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#7893A7]">
                                {section.title.toUpperCase()}
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                {section.description}
                            </h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                            {section.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        href={item.href}
                                        key={item.href}
                                        className="group rounded-xl border border-[#354654] bg-[#111B24] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#8CA8BC] hover:bg-[#172632]"
                                    >

                                        <div className="mb-5 flex items-center justify-between">

                                            <div className="rounded-xl border border-[#405565] bg-[#20313D] p-3">
                                                <Icon
                                                    size={23}
                                                    className="text-[#C4D7E4]"
                                                />
                                            </div>

                                            <ChevronRight
                                                size={19}
                                                className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-white"
                                            />

                                        </div>

                                        <h3 className="text-lg font-semibold text-white">
                                            {item.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {item.description}
                                        </p>

                                    </Link>
                                );
                            })}

                        </div>

                    </section>

                ))}

                {/* RUTA AL 112% */}
                <section className="overflow-hidden rounded-xl border border-[#43596A] bg-gradient-to-br from-[#1C2D39] to-[#101820] p-8 md:p-10">

                    <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">

                        <div className="max-w-2xl">

                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#BBD0DF]">
                                <Route size={16} />
                                EL DESAFÍO DEFINITIVO
                            </div>

                            <h2 className="text-3xl font-semibold text-white">
                                ¿Estás preparado para el 112%?
                            </h2>

                            <p className="mt-4 leading-7 text-slate-400">
                                Sigue una ruta organizada, encuentra cada
                                secreto y completa todos los desafíos
                                necesarios para dominar Hallownest.
                            </p>

                        </div>

                        <Link
                            href="/games/hollow-knight/route"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C4D7E4] px-6 py-3 text-sm font-semibold text-[#101820] transition hover:bg-white"
                        >
                            Ver la ruta
                            <ChevronRight size={17} />
                        </Link>

                    </div>

                </section>

                {/* PIE */}
                <footer className="border-t border-[#354654] py-8 text-center">

                    <p className="text-xs tracking-[0.2em] text-slate-500">
                        HOLLOWKNIGHTGUIDE
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                        Una guía independiente para explorar Hallownest.
                    </p>

                </footer>

            </div>
        </div>
    );
}
