import { db } from '../firebase/config';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, QueryConstraint 
} from 'firebase/firestore';

export const FirestoreService = {
  // Generic Create/Update
  async setDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  // Generic Read One
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  },

  // Generic Update
  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  // Generic Delete
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  },

  // Generic Query
  async queryDocuments<T>(collectionName: string, constraints: QueryConstraint[]): Promise<T[]> {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as T);
    });
    return results;
  }
};
