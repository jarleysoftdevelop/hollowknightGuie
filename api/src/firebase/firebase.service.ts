
import { Injectable } from '@nestjs/common';

import {
  getApp,
  getApps,
  initializeApp,
  applicationDefault,
  type App,
} from 'firebase-admin/app';

import {
  getFirestore,
  type Firestore,
} from 'firebase-admin/firestore';

import {
  getAuth,
  type Auth,
} from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  private readonly app: App;
  public readonly db: Firestore;
  public readonly auth: Auth;

  constructor() {
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!projectId) {
      throw new Error(
        'FIREBASE_PROJECT_ID no está configurado',
      );
    }

    this.app = getApps().length
      ? getApp()
      : initializeApp({
          credential: applicationDefault(),
          projectId,
        });

    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }
}
