import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Cliente } from '../models/cliente.model';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Clientes {
  private firestore = inject(Firestore);

  /**
   * Obtiene la lista de clientes desde Firebase.
   * Usamos 'query' y 'getDocs' para máxima compatibilidad con versiones de AngularFire.
   */
  getClientes(): Observable<Cliente[]> {
    const colRef = collection(this.firestore, 'clientes');
    // Envolvemos la referencia en query() para evitar el error de _Query
    const q = query(colRef);

    // Convertimos la Promesa de Firebase en un Observable de RxJS
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Cliente,
        ),
      ),
    );
  }

  /**
   * Registra un nuevo socio en la colección 'clientes'
   */
  addCliente(cliente: Cliente) {
    const colRef = collection(this.firestore, 'clientes');
    return addDoc(colRef, cliente);
  }

  /**
   * Comprueba si existe algún cliente con el DNI proporcionado
   */
  async checkDniExists(dni: string): Promise<boolean> {
    const colRef = collection(this.firestore, 'clientes');
    const q = query(colRef, where('dni', '==', dni), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  /**
   * Actualiza los datos de un cliente existente
   * @param id El ID del documento en Firebase
   * @param data Objeto con los campos a actualizar
   */
  updateCliente(id: string, data: any) {
    const clienteDocRef = doc(this.firestore, `clientes/${id}`);
    return updateDoc(clienteDocRef, data);
  }

  /**
   * Elimina permanentemente un cliente por su ID
   */
  async deleteCliente(id: string) {
    const clienteDocRef = doc(this.firestore, `clientes/${id}`);
    return deleteDoc(clienteDocRef);
  }
}
