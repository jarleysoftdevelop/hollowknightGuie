
import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import {
    FieldValue,
    QueryDocumentSnapshot,
    DocumentData,
} from 'firebase-admin/firestore';


export interface UserCharmProgress {
    id: string;
    obtained?: boolean;
    obtainedAt?: FirebaseFirestore.Timestamp | null;
    updatedAt?: FirebaseFirestore.Timestamp;
    charmId?: string;
    slotId?: string;
    name?: string;
}

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

    lore: string;
    detailedEffect: string;

    acquisition: CharmAcquisition;
    synergies: CharmSynergy[];
    locationDetails: CharmLocationDetails;

    spoilers: boolean;
}


@Injectable()
export class CharmsService {
    constructor(
        private readonly firebase: FirebaseService,
    ) { }

    private get charmsCollection() {
        return this.firebase.db
            .collection('games')
            .doc('hollow-knight')
            .collection('charms');
    }

    private userCharmsCollection(uid: string) {
        return this.firebase.db
            .collection('users')
            .doc(uid)
            .collection('games')
            .doc('hollow-knight')
            .collection('charms');
    }

    // Obtener catálogo completo

    async findAll() {
        const snapshot = await this.charmsCollection
            .orderBy('order', 'asc')
            .get();

        return {
            success: true,
            total: snapshot.size,
            charms: snapshot.docs.map(
                (doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id,
                    ...doc.data(),
                }),
            ),
        };
    }


    // Obtener colección personal

    async getProgress(uid: string) {
        const snapshot = await this.userCharmsCollection(uid).get();

        const charms: UserCharmProgress[] = snapshot.docs.map((doc) => {
            const data = doc.data();
          
            return {
              ...data,
              id: doc.id,
            } as UserCharmProgress;
          });

        const obtained = charms.filter(
            (charm) => charm.obtained === true,
        ).length;

        return {
            success: true,
            total: 40,
            obtained,
            pending: 40 - obtained,
            percentage: Number(
                ((obtained / 40) * 100).toFixed(2),
            ),
            charms,
        };
    }

    async updateProgress(
        uid: string,
        charmId: string,
        obtained: boolean,
    ) {
        const charmSnapshot = await this.charmsCollection
            .doc(charmId)
            .get();

        if (!charmSnapshot.exists) {
            throw new NotFoundException('Amuleto no encontrado');
        }

        const charm = charmSnapshot.data();

        if (!charm?.slotId) {
            throw new Error('El amuleto no tiene un slotId válido');
        }

        // El espacio de colección identifica el documento personal
        const ref = this.userCharmsCollection(uid)
            .doc(charm.slotId);

        await ref.set(
            {
                slotId: charm.slotId,
                charmId: charmId,
                name: charm.name,
                obtained,
                obtainedAt: obtained
                    ? FieldValue.serverTimestamp()
                    : null,
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
        );

        return {
            success: true,
            message: obtained
                ? 'Amuleto registrado correctamente'
                : 'Amuleto retirado de tu colección',
            charmId,
            slotId: charm.slotId,
            obtained,
        };
    }

}
