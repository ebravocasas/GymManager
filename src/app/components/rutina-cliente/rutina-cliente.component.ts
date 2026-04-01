import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { DialogModule } from 'primeng/dialog';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rutina-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    AccordionModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
  ],
  templateUrl: './rutina-cliente.component.html',
})
export class RutinaClienteComponent implements OnChanges {
  private firestore = inject(Firestore);

  @Input() visible: boolean = false;
  @Input() clienteId!: string;
  @Input() rutina: any = { sesiones: [] };
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() rutinaActualizada = new EventEmitter<any>();

  // Trabajaremos sobre una copia para evitar modificar el original por referencia
  rutinaEditada: any = { sesiones: [] };

  ngOnChanges(changes: SimpleChanges): void {
    // Cada vez que el modal se hace visible, clonamos la rutina original
    if (changes['visible']?.currentValue === true) {
      this.rutinaEditada = JSON.parse(JSON.stringify(this.rutina || { sesiones: [] }));
    }
  }

  getFecha(fecha: any) {
    if (!fecha) return null;
    // Si es un Timestamp de Firebase (con método toDate)
    if (typeof fecha.toDate === 'function') return fecha.toDate();
    // Si es un objeto plano resultante del clonado JSON (con propiedad seconds)
    if (fecha.seconds) return new Date(fecha.seconds * 1000);
    return fecha;
  }

  cerrar() {
    this.visibleChange.emit(false);
  }

  anadirDia() {
    const nuevoDia = {
      nombre: `Día ${this.rutinaEditada.sesiones.length + 1}`,
      ejercicios: [],
    };
    this.rutinaEditada.sesiones.push(nuevoDia);
  }

  anadirEjercicio(indexDia: number) {
    this.rutinaEditada.sesiones[indexDia].ejercicios.push({
      nombre: '',
      series: 0,
      reps: '',
      notas: '',
    });
  }

  async guardarRutina() {
    // 1. Validación de campos obligatorios
    for (const sesion of this.rutinaEditada.sesiones) {
      for (const ex of sesion.ejercicios) {
        if (!ex.nombre?.trim() || !ex.reps?.trim() || ex.series <= 0) {
          Swal.fire({
            title: 'Datos incompletos',
            text: 'Todos los ejercicios deben tener nombre, series y repeticiones.',
            icon: 'warning',
            target: 'body',
          });
          return;
        }
      }
    }

    try {
      const docRef = doc(this.firestore, 'clientes', this.clienteId);
      const dataParaGuardar = {
        rutina: { ...this.rutinaEditada, ultimaActualizacion: new Date() },
      };
      await updateDoc(docRef, dataParaGuardar);

      // Notificamos al padre para que actualice su vista local
      this.rutinaActualizada.emit(dataParaGuardar.rutina);
      this.cerrar();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la rutina', 'error');
    }
  }
}
