
import type { User } from "firebase/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  
export interface CharmAcquisition {
method: string;
requirements: string[];
steps: string[];
tips: string[];
}

export interface CharmSynergy {
charmIds: string[];
description: string;
}

export interface CharmLocationDetails {
region: string;
area: string;
description: string;
mapPointId: string | null;
}
  


export interface Charm {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  effect: string;
  notches: number;
  region: string;
  location: string;
  obtainedFrom: string;
  geoCost: number | null;
  category: string[];
  slotId: string;
  variantOf: string | null;
  isTransformation: boolean;
  completionPercent: number;
  order: number;
  imagePath: string | null;
  lore?: string;
    detailedEffect?: string;
    acquisition?: CharmAcquisition;
    synergies?: CharmSynergy[];
    locationDetails?: CharmLocationDetails;
    spoilers?: boolean;
}

export interface CharmProgress {
  id: string;
  slotId?: string;
  charmId?: string;
  obtained: boolean;
}

export interface CharmsResponse {
  success: boolean;
  total: number;
  charms: Charm[];
}

export interface ProgressResponse {
  success: boolean;
  total: number;
  obtained: number;
  pending: number;
  percentage: number;
  charms: CharmProgress[];
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

const BASE = "/games/hollow-knight/charms";

export const charmsService = {
  getAll() {
    return request<CharmsResponse>(BASE);
  },

  getProgress(user: User) {
    return request<ProgressResponse>(
      `${BASE}/progress`,
      {},
      user
    );
  },

  updateProgress(
    user: User,
    charmId: string,
    obtained: boolean
  ) {
    return request(
      `${BASE}/${encodeURIComponent(charmId)}/progress`,
      {
        method: "PATCH",
        body: JSON.stringify({ obtained }),
      },
      user
    );
  },
};
