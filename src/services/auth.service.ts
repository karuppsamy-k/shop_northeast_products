import { auth } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { FirestoreService } from './firestore.service';
import type { User } from '../models/User';

export const AuthService = {
  async register(email: string, password: string, additionalData: Partial<User>): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name: additionalData.name || '',
      phone: additionalData.phone || '',
      address: additionalData.address || '',
      avatar: additionalData.avatar || '',
      orders: [],
      cart: [],
      currentLocation: additionalData.currentLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await FirestoreService.setDocument('users', firebaseUser.uid, newUser);
    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDoc = await FirestoreService.getDocument<User>('users', firebaseUser.uid);
    if (!userDoc) {
      throw new Error('No valid user found.');
    }
    return userDoc;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  }
};
