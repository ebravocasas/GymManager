export interface Cliente {
  id?: string;
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  tarifaId: string;
  formaPago: 'Efectivo' | 'Tarjeta';
  fechaAlta: Date;
  activo: boolean;
  observaciones?: string;
  rutina?: Rutina;
}

export interface Rutina {
  ultimaActualizacion?: any; // Puede ser Date o Timestamp de Firebase
  sesiones: Sesion[];
}

export interface Sesion {
  nombre: string;
  ejercicios: Ejercicio[];
}

export interface Ejercicio {
  nombre: string;
  series: number;
  reps: string;
  notas: string;
}
