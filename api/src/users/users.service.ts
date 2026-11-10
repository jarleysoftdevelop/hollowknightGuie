
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { FieldValue } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly firebase: FirebaseService,
  ) {}

  async createProfile(
    uid: string,
    email: string,
    username: string,
  ) {
    const userRef = this.firebase.db
      .collection('users')
      .doc(uid);

    try {
      return await this.firebase.db.runTransaction(
        async (transaction) => {
          const snapshot = await transaction.get(userRef);

          // Evitar duplicar o sobrescribir perfiles existentes
          if (snapshot.exists) {
            return {
              created: false,
              uid,
              message: 'El perfil ya existe',
            };
          }

          const profile = {
            username: username.trim(),
            email,
            avatar: '',
            role: 'user',

            createdAt: FieldValue.serverTimestamp(),

            games: {
              'hollow-knight': {
                progress: 0,
                completion: 0,
                achievements: [],
                lastActivity: null,
              },
            },
          };

          transaction.create(userRef, profile);

          return {
            created: true,
            uid,
            message: 'Perfil creado correctamente',
          };
        },
      );
    } catch (error) {
      console.error('Error creando perfil:', error);

      throw new InternalServerErrorException(
        'No fue posible crear el perfil del jugador',
      );
    }
  }

  async getProfile(uid: string) {
    const snapshot = await this.firebase.db
      .collection('users')
      .doc(uid)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data();
  }
}
