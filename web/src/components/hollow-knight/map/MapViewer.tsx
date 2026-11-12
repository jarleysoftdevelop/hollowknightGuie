"use client";

import { useEffect, useRef, useState } from "react";

import type { PointerEvent } from "react";

import {

    MAP_CATEGORIES,

} from "./map.data";

import {

    type MapMarker,

    type MapMarkerCategory,

    mapsService,

} from "@/services/maps.services";

import { useAuth } from "@/contexts/AuthContext";

interface MapView {

    x: number;

    y: number;

    zoom: number;

}

interface DragState {

    pointerX: number;

    pointerY: number;

    startX: number;

    startY: number;

}

const MIN_ZOOM = 1;

const MAX_ZOOM = 5;

const ZOOM_STEP = 0.2;

const CATEGORY_STYLES: Record<

    MapMarkerCategory,

    { color: string; background: string; symbol: string }

> = {

    charm: {

        color: "#a8cfe4",

        background: "#263f52",

        symbol: "✧",

    },

    boss: {

        color: "#e4aaaa",

        background: "#512e35",

        symbol: "☠",

    },

    npc: {

        color: "#d6c5e7",

        background: "#453653",

        symbol: "♙",

    },

    collectible: {

        color: "#b9d7a8",

        background: "#304a35",

        symbol: "✿",

    },

    "point-of-interest": {

        color: "#e1c99d",

        background: "#51432f",

        symbol: "⌖",

    },

};

export default function MapViewer() {

    const { user, isAdmin, profileLoading } = useAuth();

    const [markers, setMarkers] = useState<MapMarker[]>([]);

    const [markersLoading, setMarkersLoading] = useState(true);

    const [markersError, setMarkersError] = useState<string | null>(null);

    const [savingCoordinates, setSavingCoordinates] = useState(false);

    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {

        if (profileLoading) return;

        if (!user) {

            setMarkers([]);

            setMarkersLoading(false);

            return;

        }

        let active = true;

        const loadMarkers = async () => {

            try {

                setMarkersLoading(true);

                setMarkersError(null);

                const response = await mapsService.getMarkers(user);

                if (active) {

                    setMarkers(response);

                }

            } catch (error) {

                console.error("Error cargando marcadores:", error);

                if (active) {

                    setMarkersError(

                        error instanceof Error

                            ? error.message

                            : "No fue posible cargar el mapa"

                    );

                }

            } finally {

                if (active) {

                    setMarkersLoading(false);

                }

            }

        };

        void loadMarkers();

        return () => {

            active = false;

        };

    }, [user, profileLoading]);

    const [view, setView] = useState<MapView>({

        x: 0,

        y: 0,

        zoom: 1,

    });

    const wheelContainerRef = useRef<HTMLDivElement>(null);

    const mapRef = useRef<HTMLDivElement>(null);

    const [editMode, setEditMode] = useState(false);

    const [editingMarkerId, setEditingMarkerId] = useState(

        markers[0]?.id ?? ""

    );

    useEffect(() => {

        if (!editingMarkerId && markers.length > 0) {

            const nextMarker =

                markers.find((marker) => marker.positioned === false) ??

                markers[0];

            setEditingMarkerId(nextMarker.id);

        }

    }, [markers, editingMarkerId]);

    const [draftPositions, setDraftPositions] = useState<

        Record<string, { x: number; y: number }>

    >({});

    const [lastCoordinates, setLastCoordinates] = useState<{

        x: number;

        y: number;

    } | null>(null);

    const [isDragging, setIsDragging] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState("all");

    const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(

        null

    );

    const [discoveredMarkers, setDiscoveredMarkers] = useState<Set<string>>(

        () => new Set()

    );

    const dragRef = useRef<DragState | null>(null);

    const positionedMarkers = markers.filter(

        (marker) =>

            marker.positioned !== false ||

            Boolean(draftPositions[marker.id])

    );

    const pendingMarkers = markers.filter(

        (marker) => marker.positioned === false

    );

    const visibleMarkers = positionedMarkers.filter(

        (marker) =>

            selectedCategory === "all" ||

            marker.category === selectedCategory

    );

    const zoomIn = () => {

        setView((current) => ({

            ...current,

            zoom: Math.min(MAX_ZOOM, current.zoom + ZOOM_STEP),

        }));

    };

    const zoomOut = () => {

        setView((current) => ({

            ...current,

            zoom: Math.max(MIN_ZOOM, current.zoom - ZOOM_STEP),

        }));

    };

    const resetView = () => {

        setView({ x: 0, y: 0, zoom: 1 });

    };

    const handleMapClick = (event: PointerEvent<HTMLDivElement>) => {

        if (!editMode || !mapRef.current || !editingMarkerId) return;

        const bounds = mapRef.current.getBoundingClientRect();

        const x = ((event.clientX - bounds.left) / bounds.width) * 100;

        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        if (x < 0 || x > 100 || y < 0 || y > 100) return;

        const coordinates = {

            x: Number(x.toFixed(2)),

            y: Number(y.toFixed(2)),

        };

        setDraftPositions((current) => ({

            ...current,

            [editingMarkerId]: coordinates,

        }));

        setLastCoordinates(coordinates);

    };

    const handleSaveCoordinates = async () => {

        if (!user || !editingMarkerId || !lastCoordinates) {

            return;

        }

        try {

            setSavingCoordinates(true);

            setSaveMessage("");

            const updatedMarker = await mapsService.updateMarker(

                user,

                editingMarkerId,

                {

                    x: lastCoordinates.x,

                    y: lastCoordinates.y,

                    positioned: true,

                }

            );

            setMarkers((current) =>

                current.map((marker) =>

                    marker.id === editingMarkerId

                        ? updatedMarker

                        : marker

                )

            );

            setDraftPositions((current) => {

                const next = { ...current };

                delete next[editingMarkerId];

                return next;

            });

            setSelectedMarker((current) =>

                current?.id === editingMarkerId

                    ? updatedMarker

                    : current

            );

            setLastCoordinates(null);

            setSaveMessage("Ubicación guardada correctamente.");

        } catch (error) {

            console.error("Error guardando coordenadas:", error);

            setSaveMessage(

                error instanceof Error

                    ? error.message

                    : "No fue posible guardar la ubicación."

            );

        } finally {

            setSavingCoordinates(false);

        }

    };

    useEffect(() => {

        if (markersLoading || markersError) return;

        const container = wheelContainerRef.current;

        if (!container) return;

        const handleWheel = (event: globalThis.WheelEvent) => {

            event.preventDefault();

            const direction = event.deltaY < 0 ? 1 : -1;

            setView((current) => ({

                ...current,

                zoom: Math.min(

                    MAX_ZOOM,

                    Math.max(

                        MIN_ZOOM,

                        current.zoom + direction * ZOOM_STEP

                    ),

                ),

            }));

        };

        container.addEventListener("wheel", handleWheel, {

            passive: false,

        });

        return () => {

            container.removeEventListener("wheel", handleWheel);

        };

    }, [markersLoading, markersError]);

    const handlePointerDown = (

        event: PointerEvent<HTMLDivElement>

    ) => {

        if (editMode) return;

        if (event.button !== 0) return;

        if (event.button !== 0) return;

        event.currentTarget.setPointerCapture(event.pointerId);

        dragRef.current = {

            pointerX: event.clientX,

            pointerY: event.clientY,

            startX: view.x,

            startY: view.y,

        };

        setIsDragging(true);

    };

    const handlePointerMove = (

        event: PointerEvent<HTMLDivElement>

    ) => {

        if (!dragRef.current) return;

        const drag = dragRef.current;

        setView((current) => ({

            ...current,

            x: drag.startX + event.clientX - drag.pointerX,

            y: drag.startY + event.clientY - drag.pointerY,

        }));

    };

    const handlePointerUp = () => {

        dragRef.current = null;

        setIsDragging(false);

    };

    const toggleDiscovered = (markerId: string) => {

        setDiscoveredMarkers((current) => {

            const next = new Set(current);

            if (next.has(markerId)) {

                next.delete(markerId);

            } else {

                next.add(markerId);

            }

            return next;

        });

    };

    const selectedStyle = selectedMarker

        ? CATEGORY_STYLES[selectedMarker.category]

        : null;

    return (

        <section className="overflow-hidden rounded-xl border border-[#344b5b] bg-[#080d13] shadow-2xl">

            {/* Barra superior */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#344b5b] bg-[#101d28] px-4 py-3">

                <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8bb5ce]">

                        Explorador de Hallownest

                    </p>

                    <p className="mt-1 text-xs text-[#7899af]">

                        {discoveredMarkers.size} de {markers.length} ubicaciones descubiertas

                    </p>

                </div>

                <div className="flex items-center gap-2">

                    <button

                        type="button"

                        onClick={zoomOut}

                        disabled={view.zoom <= MIN_ZOOM}

                        aria-label="Alejar mapa"

                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#344b5b] bg-[#172936] text-lg text-[#c4d7e3] transition hover:border-[#8bb5ce] disabled:opacity-40"

                    >

                        −

                    </button>

                    <span className="min-w-14 text-center text-xs tabular-nums text-[#b9d3e3]">

                        {Math.round(view.zoom * 100)}%

                    </span>

                    <button

                        type="button"

                        onClick={zoomIn}

                        disabled={view.zoom >= MAX_ZOOM}

                        aria-label="Acercar mapa"

                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#344b5b] bg-[#172936] text-lg text-[#c4d7e3] transition hover:border-[#8bb5ce] disabled:opacity-40"

                    >

                        +

                    </button>

                    <button

                        type="button"

                        onClick={resetView}

                        className="ml-1 rounded-lg border border-[#344b5b] bg-[#172936] px-3 py-2 text-xs text-[#b9d3e3] transition hover:border-[#8bb5ce] hover:text-white"

                    >

                        Restablecer

                    </button>

                </div>

            </div>

            {/* Filtros de marcadores */}

            <div className="flex gap-2 overflow-x-auto border-b border-[#344b5b] bg-[#0d1821] px-4 py-3">

                {MAP_CATEGORIES.map((category) => (

                    <button

                        key={category.id}

                        type="button"

                        onClick={() => setSelectedCategory(category.id)}

                        className={`shrink-0 rounded-lg border px-3 py-2 text-xs transition ${selectedCategory === category.id

                            ? "border-[#b6d1e1] bg-[#b6d1e1] text-[#101b25]"

                            : "border-[#344b5b] bg-[#101d28] text-[#9eb8ca] hover:border-[#8bb5ce]"

                            }`}

                    >

                        {category.label}

                    </button>

                ))}

            </div>

            {/* Editor de ubicaciones */}

            {isAdmin && (

                <div className="border-b border-[#344b5b] bg-[#101d28] p-4">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                        <div>

                            <p className="text-sm font-semibold text-white">

                                Editor de ubicaciones

                            </p>

                            <p className="mt-1 text-xs text-[#8baabe]">

                                Posiciona los marcadores directamente sobre el mapa.

                            </p>

                            <p className="mt-2 text-xs text-[#d5b58b]">

                                {pendingMarkers.length} ubicaciones pendientes por posicionar

                            </p>

                        </div>

                        <button

                            type="button"

                            onClick={() => {

                                setEditMode((current) => !current);

                                setLastCoordinates(null);

                            }}

                            className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${editMode

                                ? "border-[#d5b58b] bg-[#d5b58b] text-[#17120d]"

                                : "border-[#344b5b] bg-[#172936] text-[#b9d3e3] hover:border-[#8bb5ce]"

                                }`}

                        >

                            {editMode ? "Desactivar edición" : "Activar edición"}

                        </button>

                    </div>

                    {editMode && (

                        <div className="mt-4 space-y-4">

                            <div>

                                <label className="mb-2 block text-xs text-[#9eb8ca]">

                                    ¿Qué marcador quieres posicionar?

                                </label>

                                <select

                                    value={editingMarkerId}

                                    onChange={(event) => {

                                        setEditingMarkerId(event.target.value);

                                        setLastCoordinates(null);

                                    }}

                                    className="w-full rounded-lg border border-[#344b5b] bg-[#0d1821] px-3 py-3 text-sm text-white outline-none focus:border-[#8bb5ce]"

                                >

                                    {markers.map((marker) => (

                                        <option key={marker.id} value={marker.id}>

                                            {marker.positioned === false ? "⏳ Pendiente" : "✓ Ubicado"}

                                            {" — "}

                                            {marker.name} — {marker.region}

                                            {marker.charmIds?.length

                                                ? ` (${marker.charmIds.length} amuletos)`

                                                : ""}

                                        </option>

                                    ))}

                                </select>

                            </div>

                            <p className="text-xs leading-5 text-[#b9d3e3]">

                                Haz clic sobre el punto exacto donde debe aparecer el marcador.

                                Puedes utilizar el zoom para conseguir mayor precisión.

                            </p>

                            {lastCoordinates && (

                                <div className="rounded-lg border border-[#344b5b] bg-[#0b151e] p-4">

                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8bb5ce]">

                                        Coordenadas seleccionadas

                                    </p>

                                    <div className="grid grid-cols-2 gap-3">

                                        <div>

                                            <p className="text-xs text-[#7899af]">X</p>

                                            <p className="text-xl font-bold text-white">

                                                {lastCoordinates.x}%

                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-xs text-[#7899af]">Y</p>

                                            <p className="text-xl font-bold text-white">

                                                {lastCoordinates.y}%

                                            </p>

                                        </div>

                                    </div>

                                    <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-3 text-xs text-[#b9d3e3]">

                                        {`x: ${lastCoordinates.x},

                                    y: ${lastCoordinates.y},`}

                                    </pre>

                                    <button

                                        type="button"

                                        onClick={() => {

                                            const marker = markers.find(

                                                (item) => item.id === editingMarkerId

                                            );

                                            if (!marker) return;

                                            const code = `{

                                            id: "${marker.id}",

                                            x: ${lastCoordinates.x},

                                            y: ${lastCoordinates.y},

                                        }`;

                                            void navigator.clipboard.writeText(code);

                                        }}

                                        className="mt-3 rounded-lg border border-[#344b5b] px-4 py-2 text-xs text-[#b9d3e3] hover:border-[#8bb5ce]"

                                    >

                                        Copiar coordenadas

                                    </button>

                                    <button

                                        type="button"

                                        onClick={handleSaveCoordinates}

                                        disabled={savingCoordinates}

                                        className="mt-3 ml-2 rounded-lg border border-[#8bb5ce] bg-[#8bb5ce] px-4 py-2 text-xs font-semibold text-[#101b25] transition hover:bg-[#c0d9e8] disabled:opacity-50"

                                    >

                                        {savingCoordinates ? "Guardando..." : "Guardar ubicación"}

                                    </button>

                                    {saveMessage && (

                                        <p className="mt-3 text-xs text-[#b9d3e3]">

                                            {saveMessage}

                                        </p>

                                    )}

                                </div>

                            )}

                        </div>

                    )}

                </div>

            )}

            {markersLoading && (

                <div className="p-8 text-center text-sm text-[#9eb8ca]">

                    Explorando Hallownest...

                </div>

            )}

            {markersError && (

                <div className="p-8 text-center text-sm text-red-300">

                    {markersError}

                </div>

            )}

            {/* Visor del mapa */}

            {!markersLoading && !markersError && (

                <div

                    className={`relative flex h-[65vh] min-h-[400px] max-h-[850px] items-center justify-center overflow-hidden bg-black ${isDragging ? "cursor-grabbing" : "cursor-grab"

                        }`}

                    ref={wheelContainerRef}

                    onPointerDown={handlePointerDown}

                    onPointerMove={handlePointerMove}

                    onPointerUp={handlePointerUp}

                    onPointerCancel={handlePointerUp}

                    style={{ touchAction: "none" }}

                >

                    <div

                        className="relative shrink-0"

                        ref={mapRef}

                        onClick={handleMapClick}

                        style={{

                            width: "min(100%, 100.8vh)",

                            aspectRatio: "1600 / 1032",

                            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,

                            transformOrigin: "center center",

                            willChange: "transform",

                        }}

                    >

                        <img

                            src="/images/hollow-knight/map/hallownest-map.jpeg"

                            alt="Mapa completo del reino de Hallownest"

                            draggable={false}

                            className="pointer-events-none absolute inset-0 h-full w-full select-none"

                        />

                        {/* Capa de marcadores */}

                        {visibleMarkers.map((marker) => {

                            const style = CATEGORY_STYLES[marker.category];

                            const discovered = discoveredMarkers.has(marker.id);

                            const position = draftPositions[marker.id] ?? {

                                x: marker.x,

                                y: marker.y,

                            };

                            return (

                                <button

                                    key={marker.id}

                                    type="button"

                                    title={marker.name}

                                    aria-label={`Ver ubicación: ${marker.name}`}

                                    onPointerDown={(event) => event.stopPropagation()}

                                    onClick={(event) => {

                                        event.stopPropagation();

                                        setSelectedMarker(marker);

                                    }}

                                    className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition ${editMode

                                        ? "h-3 w-3 border text-[0px]"

                                        : "h-5 w-5 border-2 text-[10px] hover:z-20 hover:scale-125"

                                        }`}

                                    style={{

                                        left: `${position.x}%`,

                                        top: `${position.y}%`,

                                        color: style.color,

                                        backgroundColor: style.background,

                                        borderColor: discovered ? "#ffffff" : style.color,

                                        boxShadow: editMode

                                            ? `0 0 4px ${style.color}66`

                                            : `0 0 10px ${style.color}66`,

                                    }}

                                >

                                    {style.symbol}

                                    {discovered && (

                                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white" />

                                    )}

                                </button>

                            );

                        })}

                    </div>

                    <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-[10px] text-[#9eb8ca] backdrop-blur-sm">

                        Arrastra para moverte · Rueda para zoom · Selecciona un marcador

                    </div>

                </div>

            )}

            {/* Ficha de ubicación seleccionada */}

            {selectedMarker && selectedStyle && (

                <div className="border-t border-[#344b5b] bg-[#101d28] p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex gap-3">

                            <div

                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl"

                                style={{

                                    color: selectedStyle.color,

                                    backgroundColor: selectedStyle.background,

                                    borderColor: `${selectedStyle.color}66`,

                                }}

                            >

                                {selectedStyle.symbol}

                            </div>

                            <div>

                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8bb5ce]">

                                    {selectedMarker.category === "point-of-interest"

                                        ? "Punto de interés"

                                        : selectedMarker.category === "charm"

                                            ? "Amuleto"

                                            : selectedMarker.category === "boss"

                                                ? "Jefe"

                                                : selectedMarker.category === "npc"

                                                    ? "Personaje"

                                                    : "Coleccionable"}

                                </p>

                                <h3 className="mt-1 text-lg font-semibold text-white">

                                    {selectedMarker.name}

                                </h3>

                                <p className="mt-1 text-xs text-[#8baabe]">

                                    {selectedMarker.region}

                                </p>

                            </div>

                        </div>

                        <button

                            type="button"

                            onClick={() => setSelectedMarker(null)}

                            className="text-xs text-[#8baabe] transition hover:text-white"

                        >

                            Cerrar

                        </button>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#b9cbd8]">

                        {selectedMarker.description}

                    </p>

                    <button

                        type="button"

                        onClick={() => toggleDiscovered(selectedMarker.id)}

                        className={`mt-5 rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${discoveredMarkers.has(selectedMarker.id)

                            ? "border-[#8baabe] bg-[#263b49] text-[#d5e5ee]"

                            : "border-[#9bbbd0] bg-[#9bbbd0] text-[#101b25] hover:bg-[#c0d9e8]"

                            }`}

                    >

                        {discoveredMarkers.has(selectedMarker.id)

                            ? "✓ Ubicación descubierta"

                            : "Marcar como descubierta"}

                    </button>

                </div>

            )}

        </section>

    );

}
