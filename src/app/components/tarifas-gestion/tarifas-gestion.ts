import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

// Firebase & SweetAlert
import { Tarifas } from '../../services/tarifas';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tarifas-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
  ],
  templateUrl: './tarifas-gestion.html',
  styleUrl: './tarifas-gestion.scss',
})
export class TarifasGestion implements OnInit {
  private _tarifasService = inject(Tarifas);
  private cd = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  // Variables
  listaTarifas: any[] = [];
  mostrarModalAlta: boolean = false;
  mostrarModalEdicion: boolean = false;

  // Formulario Reactivo
  formTarifa: FormGroup = this.fb.group({
    id: [null], // Campo oculto para manejar el ID en edición
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    precio: [0, [Validators.required, Validators.min(0.01)]], // Mayor a 0
    duracionDias: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
  });

  // Getter para acceder fácilmente a los controles en el HTML si es necesario
  // Por ejemplo: <small *ngIf="f['nombre'].invalid">Error</small>
  get f() {
    return this.formTarifa.controls;
  }

  ngOnInit() {
    this.cargarTarifas();
  }

  // --- LÓGICA DE CARGA ---
  cargarTarifas() {
    this._tarifasService.getTarifas().subscribe({
      next: (res) => {
        this.listaTarifas = res;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar tarifas:', err),
    });
  }

  // --- ABRIR MODAL ALTA ---
  abrirAlta() {
    this.formTarifa.reset({ nombre: '', precio: 0, duracionDias: 30 });
    this.mostrarModalAlta = true;
  }

  // --- GUARDAR NUEVA ---
  async guardarTarifa() {
    if (this.formTarifa.invalid) {
      this.formTarifa.markAllAsTouched();
      Swal.fire({
        title: 'Error',
        text: 'Verifica los campos del formulario',
        icon: 'warning',
        target: 'body',
      });
      return;
    }

    const nuevaTarifa = this.formTarifa.value;
    delete nuevaTarifa.id; // No enviamos ID al crear

    try {
      await this._tarifasService.addTarifa(nuevaTarifa);
      this.cargarTarifas(); // Recargar la lista tras crear
      Swal.fire({
        title: '¡Éxito!',
        text: 'Tarifa creada correctamente',
        icon: 'success',
        target: 'body',
      });
      this.mostrarModalAlta = false; // Cerrar modal
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la tarifa',
        icon: 'error',
        target: 'body',
      });
    }
  }

  // --- EDITAR ---
  verDetalleTarifa(tarifa: any) {
    this.formTarifa.patchValue(tarifa);
    this.mostrarModalEdicion = true;
  }

  async actualizarTarifa() {
    if (this.formTarifa.invalid) {
      this.formTarifa.markAllAsTouched();
      Swal.fire({
        title: 'Error',
        text: 'Verifica los campos del formulario',
        icon: 'warning',
        target: 'body',
      });
      return;
    }

    const tarifaEditada = this.formTarifa.value;
    try {
      await this._tarifasService.updateTarifa(tarifaEditada.id, tarifaEditada);
      this.cargarTarifas(); // Recargar la lista tras actualizar
      Swal.fire({
        title: 'Actualizado',
        text: 'La tarifa se ha modificado',
        icon: 'success',
        target: 'body',
      });
      this.mostrarModalEdicion = false;
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo actualizar', icon: 'error', target: 'body' });
    }
  }

  // --- ELIMINAR ---
  async eliminarTarifa(tarifa: any) {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás la tarifa "${tarifa.nombre}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      background: '#1e1e1e',
      color: '#fff',
      target: 'body',
    });

    if (confirmacion.isConfirmed) {
      try {
        await this._tarifasService.deleteTarifa(tarifa.id);
        this.cargarTarifas(); // Recargar la lista tras eliminar
        Swal.fire({
          title: 'Eliminado',
          text: 'Tarifa borrada correctamente',
          icon: 'success',
          target: 'body',
        });
      } catch (error) {
        Swal.fire({ title: 'Error', text: 'No se pudo eliminar', icon: 'error', target: 'body' });
      }
    }
  }
}
