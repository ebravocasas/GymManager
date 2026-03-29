import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  deleteDoc,
  query,
  Query,
  DocumentData,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { Tarifa } from '../models/tarifa.model';

@Injectable({
  providedIn: 'root',
})
export class Tarifas {
  private firestore = inject(Firestore);

  getTarifas(): Observable<Tarifa[]> {
    // Obtenemos la referencia
    const colRef = collection(this.firestore, 'tarifas');

    // Usamos getDocs (promesa) y la convertimos a Observable con 'from'
    // Esto evita el error de tipo de collectionData en versiones inestables
    return from(getDocs(query(colRef))).pipe(
      map((snapshot) => {
        return snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Tarifa,
        );
      }),
    );
  }

  addTarifa(tarifa: Tarifa) {
    const colRef = collection(this.firestore, 'tarifas');
    return addDoc(colRef, tarifa);
  }

  updateTarifa(id: string, data: any) {
    const tarifaDocRef = doc(this.firestore, `tarifas/${id}`);
    return updateDoc(tarifaDocRef, data);
  }

  deleteTarifa(id: string) {
    const tarifaDocRef = doc(this.firestore, `tarifas/${id}`);
    return deleteDoc(tarifaDocRef);
  }
}
