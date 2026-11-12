
export type MapMarkerCategory =
  | "charm"
  | "boss"
  | "npc"
  | "collectible"
  | "point-of-interest";

export interface MapMarker {
  id: string;
  name: string;
  category: MapMarkerCategory;
  region: string;
  description: string;
  x: number;
  y: number;
  discovered: boolean;
}

export const MAP_CATEGORIES = [
  { id: "all", label: "Todos", icon: "map-pin" },
  { id: "charm", label: "Amuletos", icon: "gem" },
  { id: "boss", label: "Jefes", icon: "skull" },
  { id: "npc", label: "Personajes", icon: "users" },
  { id: "collectible", label: "Coleccionables", icon: "bug" },
  {
    id: "point-of-interest",
    label: "Puntos de interés",
    icon: "compass",
  },
] as const;

// Coordenadas provisionales para probar el sistema.
// Se ajustarán visualmente sobre el mapa definitivo.
export const MAP_MARKERS: MapMarker[] = [
    
    {
      id: "wayward-compass",
      name: "Brújula Caprichosa",
      category: "charm",
      region: "Bocasucia",
      description:
        "Amuleto que muestra la ubicación del portador en el mapa cuando está equipado.",
      x: 28,
      y: 12,
      discovered: false,
    },
    {
      id: "elderbug",
      name: "Anciano",
      category: "npc",
      region: "Bocasucia",
      description:
        "Habitante de Bocasucia que ofrece información sobre Hallownest y sus habitantes.",
      x: 27,
      y: 9,
      discovered: false,
    },
    {
      id: "dirtmouth-stag",
      name: "Estación de ciervos de Bocasucia",
      category: "point-of-interest",
      region: "Bocasucia",
      description:
        "Punto de transporte que permite viajar entre estaciones de ciervos desbloqueadas.",
      x: 29,
      y: 14,
      discovered: false,
    },
    
];
