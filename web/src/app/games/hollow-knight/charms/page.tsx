
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

import {
    charmsService,
    type Charm,
    type CharmProgress,
} from "@/services/charms.service";

import CharmCard from "@/components/hollow-knight/charms/CharmCard";
import CharmDetails from "@/components/hollow-knight/charms/CharmDetails";

const CATEGORIES = [
    { id: "all", label: "Todos" },
    { id: "combate", label: "Combate" },
    { id: "defensa", label: "Defensa" },
    { id: "exploracion", label: "Exploración" },
    { id: "soul", label: "SOUL" },
    { id: "movilidad", label: "Movilidad" },
    { id: "economia", label: "Economía" },
    { id: "historia", label: "Historia" },
];

export default function CharmsPage() {
    const { user, loading: authLoading } = useAuth();

    const [charms, setCharms] = useState<Charm[]>([]);
    const [progress, setProgress] = useState<CharmProgress[]>([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedCharm, setSelectedCharm] = useState<Charm | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar catálogo y progreso del usuario
    const loadData = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const [catalogResponse, progressResponse] = await Promise.all([
                charmsService.getAll(),
                charmsService.getProgress(user),
            ]);

            setCharms(catalogResponse.charms);
            setProgress(progressResponse.charms);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No fue posible cargar los amuletos."
            );
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            setCharms([]);
            setProgress([]);
            return;
        }

        void loadData();
    }, [authLoading, user, loadData]);

    // Identificar las versiones concretas conseguidas
    const obtainedCharms = useMemo(() => {
        return new Set(
            progress
                .filter((item) => item.obtained)
                .map((item) => item.charmId)
                .filter((id): id is string => Boolean(id))
        );
    }, [progress]);

    // Contabilizar espacios únicos de colección
    const obtainedSlots = useMemo(() => {
        return new Set(
            progress
                .filter((item) => item.obtained)
                .map((item) => item.slotId ?? item.id)
        );
    }, [progress]);

    const obtainedCount = obtainedSlots.size;

    const percentage = Math.min(
        100,
        (obtainedCount / 40) * 100
    );

    // Mostrar la versión exacta que posee el jugador
    const isObtained = (charm: Charm) => {
        return obtainedCharms.has(charm.id);
    };

    // Filtrar amuletos por nombre y categoría
    const filteredCharms = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return charms.filter((charm) => {
            const matchesSearch =
                charm.name.toLowerCase().includes(normalizedSearch) ||
                charm.nameEn.toLowerCase().includes(normalizedSearch);

            const matchesCategory =
                category === "all" ||
                charm.category.includes(category);

            return matchesSearch && matchesCategory;
        });
    }, [charms, search, category]);

    // Actualizar progreso del usuario
    const handleToggle = async (
        charm: Charm,
        obtained: boolean
    ) => {
        if (!user || saving) return;

        setSaving(true);
        setError(null);

        try {
            await charmsService.updateProgress(
                user,
                charm.id,
                obtained
            );

            const response = await charmsService.getProgress(user);

            setProgress(response.charms);
            setSelectedCharm(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No fue posible guardar el progreso."
            );
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="p-10 text-[#a9c8dc]">
                Cargando los secretos de Hallownest...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-10 text-[#c4d7e3]">
                Inicia sesión para consultar tu colección.
            </div>
        );
    }

    return (
        <main className="min-h-screen w-full px-5 py-10 text-white sm:px-8 lg:px-10 2xl:px-14">
            <div className="w-full">
                <header className="mb-10">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#8bb5ce]">
                        Enciclopedia de Hallownest
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        Amuletos
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9eb8ca]">
                        Descubre los amuletos del reino, aprende sus efectos,
                        encuentra sus ubicaciones y registra los que has conseguido.
                    </p>
                </header>

                {/* Progreso de colección */}
                <section className="mb-8 rounded-xl border border-[#344b5b] bg-[#101d28]/90 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-[#8baabe]">
                                Mi colección
                            </p>

                            <h2 className="mt-2 text-3xl font-bold">
                                {obtainedCount}
                                <span className="text-lg text-[#7899af]">
                                    {" "}/ 40
                                </span>
                            </h2>
                        </div>

                        <p className="text-sm text-[#b9d3e3]">
                            {percentage.toFixed(1)}%
                        </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#273c4a]">
                        <div
                            className="h-full rounded-full bg-[#a8cfe4] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </section>

                {/* Mensajes de error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200"
                    >
                        {error}
                    </div>
                )}

                {/* Búsqueda y categorías */}
                <section className="mb-8 flex flex-col gap-4 lg:flex-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar un amuleto..."
                        className="w-full rounded-lg border border-[#344b5b] bg-[#101d28] px-4 py-3 text-sm text-white outline-none focus:border-[#9ec4dc] lg:max-w-sm"
                    />

                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setCategory(item.id)}
                                className={`rounded-lg border px-3 py-2 text-xs transition ${category === item.id
                                        ? "border-[#b6d1e1] bg-[#b6d1e1] text-[#101b25]"
                                        : "border-[#344b5b] bg-[#101d28] text-[#9eb8ca] hover:border-[#8bb5ce]"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Resultados */}
                <p className="mb-5 text-xs text-[#8baabe]">
                    Mostrando {filteredCharms.length} de {charms.length} formas de amuletos
                </p>

                <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {filteredCharms.map((charm) => (
                        <CharmCard
                            key={charm.id}
                            charm={charm}
                            obtained={isObtained(charm)}
                            onSelect={setSelectedCharm}
                        />
                    ))}
                </section>

                {filteredCharms.length === 0 && (
                    <p className="py-16 text-center text-[#8baabe]">
                        No encontramos amuletos con esos filtros.
                    </p>
                )}
            </div>

            {/* Detalles del amuleto */}
            {selectedCharm && (
                <CharmDetails
                    charm={selectedCharm}
                    obtained={isObtained(selectedCharm)}
                    saving={saving}
                    onClose={() => setSelectedCharm(null)}
                    onToggle={handleToggle}
                />
            )}
        </main>
    );
}
