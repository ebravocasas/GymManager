export interface Tarifa {
  id?: string; // El id es opcional porque Firebase lo genera solo
  nombre: string; // Ej: "Mensual", "Trimestral"
  precio: number; // Ej: 40
  duracionDias: number; // Ej: 30
}
