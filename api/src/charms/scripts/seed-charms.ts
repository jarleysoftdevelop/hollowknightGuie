
import { NestFactory } from '@nestjs/core';
import { FieldValue } from 'firebase-admin/firestore';

import { AppModule } from '../../app.module.js';
import { FirebaseService } from '../../firebase/firebase.service.js';
import { CHARMS } from '../data/charms.data.js';

async function seedCharms() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const firebase = app.get(FirebaseService);
    const db = firebase.db;

    // Validar identificadores
    const ids = CHARMS.map((charm) => charm.id);
    const slotIds = CHARMS.map((charm) => charm.slotId);

    if (new Set(ids).size !== CHARMS.length) {
      throw new Error('Existen IDs de amuletos duplicados.');
    }

    if (new Set(slotIds).size !== 40) {
      throw new Error(
        `Se esperaban 40 espacios de colección y se encontraron ${new Set(slotIds).size}.`,
      );
    }

    if (CHARMS.length !== 45) {
      throw new Error(
        `Se esperaban 45 registros y se encontraron ${CHARMS.length}.`,
      );
    }

    const collection = db
      .collection('games')
      .doc('hollow-knight')
      .collection('charms');

    const batch = db.batch();

    for (const charm of CHARMS) {
      const ref = collection.doc(charm.id);

      batch.set(
        ref,
        {
          ...charm,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    await batch.commit();

    console.log('====================================');
    console.log('CATÁLOGO DE AMULETOS CARGADO');
    console.log('====================================');
    console.log(`Registros: ${CHARMS.length}`);
    console.log(`Espacios de colección: ${new Set(slotIds).size}`);
    console.log('Documentos actualizados correctamente.');
    console.log('====================================');

  } catch (error) {
    console.error('Error cargando amuletos:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seedCharms();
