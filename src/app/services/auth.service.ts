import { Injectable, inject, Optional } from '@angular/core';
import { 
  Auth, 
  GoogleAuthProvider, 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth, { optional: true });

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    if (this.auth) {
      onAuthStateChanged(this.auth, (user) => {
        this.userSubject.next(user);
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
}
