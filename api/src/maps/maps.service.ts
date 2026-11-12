
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';
import { CHARMS } from '../charms/data/charms.data.js';

export type MapMarkerCategory =
    | 'charm'
    | 'boss'
    | 'npc'
    | 'collectible'
    | 'point-of-interest';

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

@Injectable()
export class MapsService {
    private readonly collectionName = 'maps';

    constructor(
        private readonly firebase: FirebaseService,
    ) {}

    private getMarkersCollection(gameId: string) {
        return this.firebase.db
            .collection(this.collectionName)
            .doc(gameId)
            .collection('markers');
    }

    async findAll(gameId: string): Promise<MapMarker[]> {
        const snapshot = await this.getMarkersCollection(gameId).get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as MapMarker[];
    }

    /**
     * Crea un marcador individual por cada amuleto.
     */
    private generateCharmMarkers(): MapMarker[] {
        return CHARMS.map((charm) => ({
            id: charm.id,
            name: charm.name,
            category: 'charm',
            region: charm.region,
            description:
                `${charm.description}\n\n` +
                `Efecto: ${charm.effect}\n\n` +
                `Ubicación: ${charm.location}\n\n` +
                `Cómo conseguirlo: ${charm.obtainedFrom}`,
            x: 0,
            y: 0,
            discovered: false,
            positioned: false,
            charmIds: [charm.id],
        }));
    }

    async seedInitialMarkers(gameId: string): Promise<{
        inserted: number;
        skipped: number;
        removed: number;
    }> {
        const initialMarkers: MapMarker[] = [
            {
                id: 'elderbug',
                name: 'Anciano',
                category: 'npc',
                region: 'Bocasucia',
                description:
                    'Habitante de Bocasucia que ofrece información sobre Hallownest y sus habitantes.',
                x: 27,
                y: 9,
                discovered: false,
                positioned: true,
            },
            {
                id: 'dirtmouth-stag',
                name: 'Estación de ciervos de Bocasucia',
                category: 'point-of-interest',
                region: 'Bocasucia',
                description:
                    'Punto de transporte que permite viajar entre estaciones de ciervos desbloqueadas.',
                x: 29,
                y: 14,
                discovered: false,
                positioned: true,
            },
        ];

        const charmMarkers = this.generateCharmMarkers();
        const collection = this.getMarkersCollection(gameId);

        const existingSnapshot = await collection.get();
        const existingIds = new Set(
            existingSnapshot.docs.map((doc) => doc.id),
        );

        const batch = this.firebase.db.batch();

        let inserted = 0;
        let skipped = 0;
        let removed = 0;

        // 1. Crear marcadores iniciales que todavía no existan.
        for (const marker of initialMarkers) {
            const markerRef = collection.doc(marker.id);

            if (existingIds.has(marker.id)) {
                skipped++;
                continue;
            }

            this.validateMarker(marker);
            batch.create(markerRef, marker);
            inserted++;
        }

        // 2. Crear un marcador individual por cada amuleto.
        for (const marker of charmMarkers) {
            const markerRef = collection.doc(marker.id);

            // La Brújula Caprichosa ya existe.
            // Conservamos sus coordenadas y añadimos la relación
            // con el catálogo sin sobrescribir su ubicación.
            if (existingIds.has(marker.id)) {
                if (marker.id === 'wayward-compass') {
                    batch.set(
                        markerRef,
                        {
                            charmIds: ['wayward-compass'],
                            positioned: true,
                        },
                        { merge: true },
                    );
                } else {
                    skipped++;
                }

                continue;
            }

            this.validateMarker(marker);
            batch.create(markerRef, marker);
            inserted++;
        }

        // 3. Retirar los antiguos marcadores agrupados.
        for (const doc of existingSnapshot.docs) {
            if (doc.id.startsWith('charm-location-')) {
                batch.delete(doc.ref);
                removed++;
            }
        }

        if (inserted > 0 || removed > 0 || existingIds.has('wayward-compass')) {
            await batch.commit();
        }

        return {
            inserted,
            skipped,
            removed,
        };
    }

    async create(
        gameId: string,
        marker: MapMarker,
    ): Promise<MapMarker> {
        this.validateMarker(marker);

        const markerRef = this.getMarkersCollection(gameId)
            .doc(marker.id);

        const existing = await markerRef.get();

        if (existing.exists) {
            throw new BadRequestException(
                'Ya existe un marcador con ese identificador',
            );
        }

        await markerRef.set(marker);

        return marker;
    }

    async update(
        gameId: string,
        markerId: string,
        data: Partial<MapMarker>,
    ): Promise<MapMarker> {
        const markerRef = this.getMarkersCollection(gameId)
            .doc(markerId);

        const snapshot = await markerRef.get();

        if (!snapshot.exists) {
            throw new NotFoundException('Marcador no encontrado');
        }

        const updated = {
            ...snapshot.data(),
            ...data,
            id: markerId,
        } as MapMarker;

        this.validateMarker(updated);

        await markerRef.set(updated);

        return updated;
    }

    async remove(
        gameId: string,
        markerId: string,
    ): Promise<{ success: boolean }> {
        const markerRef = this.getMarkersCollection(gameId)
            .doc(markerId);

        const snapshot = await markerRef.get();

        if (!snapshot.exists) {
            throw new NotFoundException('Marcador no encontrado');
        }

        await markerRef.delete();

        return { success: true };
    }

    private validateMarker(marker: MapMarker): void {
        const validCategories: MapMarkerCategory[] = [
            'charm',
            'boss',
            'npc',
            'collectible',
            'point-of-interest',
        ];

        if (
            !marker.id?.trim() ||
            !marker.name?.trim() ||
            !marker.region?.trim() ||
            typeof marker.description !== 'string' ||
            !validCategories.includes(marker.category) ||
            !Number.isFinite(marker.x) ||
            !Number.isFinite(marker.y) ||
            marker.x < 0 ||
            marker.x > 100 ||
            marker.y < 0 ||
            marker.y > 100 ||
            typeof marker.discovered !== 'boolean' ||
            (marker.positioned !== undefined &&
                typeof marker.positioned !== 'boolean') ||
            (marker.charmIds !== undefined &&
                (!Array.isArray(marker.charmIds) ||
                    !marker.charmIds.every(
                        (id) => typeof id === 'string',
                    )))
        ) {
            throw new BadRequestException(
                'Los datos del marcador no son válidos',
            );
        }
    }
}
