import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signOut,
  User,
  setPersistence,
  browserSessionPersistence,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  // Observable que emite el estado del usuario (null si no está logueado)
  user$: Observable<User | null> = authState(this.auth);

  async login(email: string, pass: string) {
    // Configuramos la persistencia para que la sesión se destruya al cerrar la pestaña o app
    await setPersistence(this.auth, browserSessionPersistence);
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  // Método para obtener el UID si es necesario para permisos en Firestore
  get currentUserId() {
    return this.auth.currentUser?.uid;
  }
}
