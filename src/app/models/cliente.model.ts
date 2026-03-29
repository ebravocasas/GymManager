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
}
