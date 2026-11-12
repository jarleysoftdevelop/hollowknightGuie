
import type { User } from "firebase/auth";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
    positioned?: boolean;
    charmIds?: string[];
}

interface MarkersResponse {
    success?: boolean;
    markers?: MapMarker[];
}

async function request<T>(
    path: string,
    options: RequestInit = {},
    user?: User | null
): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body) {
        headers.set("Content-Type", "application/json");
    }

    if (user) {
        const token = await user.getIdToken();
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(
            error?.message ?? `Error HTTP ${response.status}`
        );
    }

    return response.json() as Promise<T>;
}

const BASE = "/maps/hollow-knight/markers";

export const mapsService = {
    getMarkers(user: User) {
        return request<MapMarker[]>(BASE, {}, user);
    },

    createMarker(user: User, marker: MapMarker) {
        return request<MapMarker>(
            BASE,
            {
                method: "POST",
                body: JSON.stringify(marker),
            },
            user
        );
    },

    updateMarker(
        user: User,
        markerId: string,
        data: Partial<MapMarker>
    ) {
        return request<MapMarker>(
            `${BASE}/${encodeURIComponent(markerId)}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            },
            user
        );
    },

    deleteMarker(user: User, markerId: string) {
        return request<{ success: boolean }>(
            `${BASE}/${encodeURIComponent(markerId)}`,
            {
                method: "DELETE",
            },
            user
        );
    },
};
