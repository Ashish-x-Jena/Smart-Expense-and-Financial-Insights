import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

export interface FirestoreErrorInfo {
  code: string;
  message: string;
  details?: unknown;
}

export function handleFirestoreError(error: unknown, context: string): FirestoreErrorInfo {
  console.error(`[Firestore Error - ${context}]:`, error);
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const fbErr = error as { code: string; message: string };
    return {
      code: fbErr.code,
      message: fbErr.message || `An error occurred during ${context}`,
    };
  }
  return {
    code: 'unknown',
    message: error instanceof Error ? error.message : `Unknown error during ${context}`,
  };
}

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || undefined,
};

// Initialize Firebase App instance idempotently
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured
export const db: Firestore =
  firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
    : getFirestore(app);

// Initialize Auth
export const auth: Auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  try {
    const res = await signInWithPopup(auth, googleAuthProvider);
    return res.user;
  } catch (err) {
    throw handleFirestoreError(err, 'signInWithGoogle');
  }
}

export async function logOutFirebase() {
  try {
    await fbSignOut(auth);
  } catch (err) {
    throw handleFirestoreError(err, 'signOut');
  }
}
