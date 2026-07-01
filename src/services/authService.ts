import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    return { user: credential.user, error: null };
  } catch (err: any) {
    return { user: null, error: mapFirebaseError(err.code) };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { user: credential.user, error: null };
  } catch (err: any) {
    return { user: null, error: mapFirebaseError(err.code) };
  }
}

export async function logoutUser(): Promise<{ error: string | null }> {
  try {
    await signOut(auth);
    return { error: null };
  } catch (err: any) {
    return { error: 'Failed to sign out. Please try again.' };
  }
}

// Firebase error codes are things like "auth/email-already-in-use" —
// not something you want to show a user directly. Translate the common ones.
function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}