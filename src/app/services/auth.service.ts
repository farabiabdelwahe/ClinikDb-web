import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';
import { BehaviorSubject, map } from 'rxjs';
import { AppUser, UserRole } from '../models/app-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth, { optional: true });
  private firestore = inject(Firestore, { optional: true });

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private appUserSubject = new BehaviorSubject<AppUser | null>(null);
  appUser$ = this.appUserSubject.asObservable();

  isAdmin$ = this.appUser$.pipe(map((user) => user?.role === 'admin'));

  constructor() {
    if (this.auth) {
      onAuthStateChanged(this.auth, async (user) => {
        this.userSubject.next(user);

        if (user) {
          const appUser = await this.resolveAppUser(user);
          this.appUserSubject.next(appUser);
        } else {
          this.appUserSubject.next(null);
        }
      });
    } else {
      console.warn('Firebase Auth not configured - auth functionality disabled');
    }
  }

  async signInWithGoogle(): Promise<void> {
    if (!this.auth) {
      console.warn('Firebase Auth not configured');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  private toMillis(value: unknown): number {
    if (!value) {
      return Date.now();
    }

    if (typeof value === 'number') {
      return value;
    }

    if (value instanceof Timestamp) {
      return value.toMillis();
    }

    if (typeof value === 'object' && 'seconds' in (value as Record<string, unknown>)) {
      const seconds = Number((value as any).seconds ?? 0);
      const nanoseconds = Number((value as any).nanoseconds ?? 0);
      return seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
    }

    return Date.now();
  }

  private async resolveAppUser(user: User): Promise<AppUser> {
    const fallback: AppUser = {
      id: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? user.email ?? 'Doctor',
      role: 'doctor',
      createdAt: Date.now(),
      photoURL: user.photoURL ?? null,
    };

    if (!this.firestore) {
      return fallback;
    }

    try {
      type FirestoreUserDoc = {
        email?: string;
        displayName?: string;
        role?: UserRole;
        createdAt?: any;
        photoURL?: string | null;
      };

      const db = this.firestore;
      const usersCollection = collection(db, 'users');
      const normalizedEmail = user.email?.toLowerCase() ?? null;
      const primaryDocRef = doc(usersCollection, user.uid);

      let docSnap = await getDoc(primaryDocRef);

      if (!docSnap.exists()) {
        const baseDoc: FirestoreUserDoc = {
          email: normalizedEmail ?? fallback.email,
          displayName: user.displayName ?? normalizedEmail ?? fallback.displayName,
          role: 'doctor',
          photoURL: user.photoURL ?? null,
          createdAt: serverTimestamp(),
        };
        await setDoc(primaryDocRef, baseDoc, { merge: true });
        docSnap = await getDoc(primaryDocRef);
      }

      let docData = docSnap.data() as FirestoreUserDoc | undefined;

      let data: FirestoreUserDoc = docData ?? {
        email: normalizedEmail ?? fallback.email,
        displayName: user.displayName ?? normalizedEmail ?? fallback.displayName,
        role: 'doctor',
        photoURL: user.photoURL ?? null,
        createdAt: Date.now(),
      };

      {
        const updates: Partial<FirestoreUserDoc> = {};
        if (normalizedEmail && normalizedEmail !== data.email) {
          updates.email = normalizedEmail;
        }
        if (user.displayName && user.displayName !== data.displayName) {
          updates.displayName = user.displayName;
        }
        if (user.photoURL && user.photoURL !== data.photoURL) {
          updates.photoURL = user.photoURL;
        }
        if (Object.keys(updates).length) {
          await updateDoc(primaryDocRef, updates);
          data = { ...data, ...updates };
        }
      }

      // Determine role precedence: explicit doc role, admin membership, agent membership
      let role: UserRole = (data.role as UserRole) ?? 'doctor';

      const adminMembership = await getDocs(
        query(collection(db, 'admins'), where('userId', '==', user.uid), limit(1))
      );
      const isAdmin = !adminMembership.empty;
      if (isAdmin && role !== 'admin') {
        role = 'admin';
        await updateDoc(primaryDocRef, { role: 'admin' });
      }

      if (!isAdmin) {
        let agentDoc = await getDocs(
          query(collection(db, 'agents'), where('userId', '==', user.uid), limit(1))
        );

        if (agentDoc.empty && normalizedEmail) {
          agentDoc = await getDocs(
            query(collection(db, 'agents'), where('email', '==', normalizedEmail), limit(1))
          );
          if (!agentDoc.empty) {
            const agentRef = doc(collection(db, 'agents'), agentDoc.docs[0].id);
            const agentData = agentDoc.docs[0].data();
            if (!agentData['userId']) {
              await updateDoc(agentRef, { userId: user.uid });
            }
          }
        }

        if (!agentDoc.empty && role !== 'agent') {
          role = 'agent';
          await updateDoc(primaryDocRef, { role: 'agent' });
        }
      }

      const createdAt = this.toMillis(data.createdAt);
      return {
        id: user.uid,
        email: normalizedEmail ?? data.email ?? fallback.email,
        displayName: data.displayName ?? fallback.displayName,
        role,
        createdAt,
        photoURL: user.photoURL ?? data.photoURL ?? null,
      };
    } catch (error) {
      console.error('Failed to resolve app user from Firestore', error);
      return fallback;
    }
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential | null> {
    if (!this.auth) {
      console.warn('Firebase Auth not configured');
      return null;
    }
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Email login successful:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        emailVerified: result.user.emailVerified
      });
      return result;
    } catch (error: any) {
      console.error('❌ Email login failed:', error.message);
      throw error;
    }
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential | null> {
    if (!this.auth) {
      console.warn('Firebase Auth not configured');
      return null;
    }
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('✅ User registration successful:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        emailVerified: result.user.emailVerified
      });
      return result;
    } catch (error: any) {
      console.error('❌ User registration failed:', error.message);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.auth) {
      console.warn('Firebase Auth not configured');
      return;
    }
    await signOut(this.auth);
    console.log('👋 User signed out successfully');
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get currentAppUser(): AppUser | null {
    return this.appUserSubject.value;
  }
}
