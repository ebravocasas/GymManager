import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  where,
  doc,
  setDoc,
  collectionData, // Cambiamos collectionData por getDocs para imitar a Clientes
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Pagos {
  private firestore = inject(Firestore);

  async registrarPago(pago: any) {
    const pagosRef = collection(this.firestore, 'pagos');
    return await addDoc(pagosRef, {
      ...pago,
      fechaPago: new Date(),
    });
  }

  /**
   * Recupera el último pago registrado para un cliente específico
   */
  async getUltimoPago(clienteId: string) {
    const pagosRef = collection(this.firestore, 'pagos');
    const q = query(
      pagosRef,
      where('clienteId', '==', clienteId),
      // Quitamos orderBy y limit para evitar errores de índice en Firebase
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Procesamos y ordenamos los datos en memoria
    const pagos = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        fechaPago: data['fechaPago']?.toDate
          ? data['fechaPago'].toDate()
          : new Date(data['fechaPago']),
      };
    });

    // Ordenamos por fecha descendente (el más nuevo primero)
    pagos.sort((a: any, b: any) => b.fechaPago - a.fechaPago);

    return pagos[0];
  }

  // Usamos getDocs y 'from' de RxJS, igual que haces en Clientes
  getHistorialPagos(): Observable<any[]> {
    const pagosRef = collection(this.firestore, 'pagos');
    const q = query(pagosRef, orderBy('fechaPago', 'desc'));

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      ),
    );
  }

  async guardarCierreMensual(mes: string, año: number, total: number) {
    const cierresRef = collection(this.firestore, 'cierres_mensuales');
    return await addDoc(cierresRef, {
      mes: mes,
      año: año,
      totalRecaudado: total,
      fechaCierre: new Date(),
    });
  }

  async guardarCierreEstadistico(mes: number, año: number, total: number, nombreMes: string) {
    const idDoc = `${año}-${mes + 1}`; // Ejemplo: 2024-3
    const docRef = doc(this.firestore, `estadisticas_mensuales/${idDoc}`);

    // setDoc con { merge: true } actualiza el total si el mes ya existe o lo crea si no
    return await setDoc(
      docRef,
      {
        mesNombre: nombreMes,
        mesNumero: mes + 1,
        año: año,
        totalRecaudado: total,
        ultimaActualizacion: new Date(),
      },
      { merge: true },
    );
  }

  getEstadisticasMensuales(): Observable<any[]> {
    const colRef = collection(this.firestore, 'estadisticas_mensuales');
    const q = query(colRef, orderBy('año', 'asc'), orderBy('mesNumero', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
}
