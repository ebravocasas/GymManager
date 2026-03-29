import { inject, Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  // Observable que emite el estado del usuario (null si no está logueado)
  user$: Observable<User | null> = authState(this.auth);

  login(email: string, pass: string) {
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
