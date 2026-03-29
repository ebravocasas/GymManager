import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

// Modelos y Servicios
import { Cliente } from '../../models/cliente.model';
import { Tarifa } from '../../models/tarifa.model';
import { Tarifas } from '../../services/tarifas';
import { Clientes } from '../../services/clientes';
import { Pagos } from '../../services/pagos';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    TextareaModule,
    TableModule,
    DialogModule,
  ],
  templateUrl: './clientes-gestion.html',
  styleUrl: './clientes-gestion.scss',
})
export class ClientesGestion implements OnInit {
  private _clientesService = inject(Clientes);
  private _tarifasService = inject(Tarifas);
  private _pagosService = inject(Pagos);
  private cd = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  // Datos
  listaClientes: Cliente[] = [];
  listaTarifas: Tarifa[] = [];

  // Estado de carga para la tabla
  cargando: boolean = true;

  // Modales
  mostrarModal: boolean = false;
  mostrarDetalle: boolean = false;
  clienteSeleccionado: any = null;
  ultimoPago: any = null; // Variable para almacenar el dato

  formasPago = [
    { label: 'Efectivo', value: 'Efectivo' },
    { label: 'Tarjeta', value: 'Tarjeta' },
  ];

  formCliente: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
    telefono: ['', Validators.required],
    tarifaId: ['', Validators.required],
    formaPago: ['Efectivo', Validators.required],
    fechaAlta: [new Date(), Validators.required],
    activo: [true],
    observaciones: [''],
  });

  ngOnInit(): void {
    this.cargarDatosIniciales();

    // Limpiar el error de DNI duplicado cuando el usuario modifica el campo
    this.f['dni'].valueChanges.subscribe(() => {
      if (this.f['dni'].hasError('dniDuplicado')) {
        const { dniDuplicado, ...errors } = this.f['dni'].errors ?? {};
        this.f['dni'].setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    });
  }

  get f() {
    return this.formCliente.controls;
  }

  cargarDatosIniciales() {
    this.cargando = true;
    // Cargamos tarifas primero para tener los nombres listos
    this._tarifasService.getTarifas().subscribe({
      next: (tarifas) => {
        this.listaTarifas = [...tarifas];
        this.obtenerClientes();
      },
      error: () => {},
    });
  }

  obtenerClientes() {
    this._clientesService.getClientes().subscribe({
      next: (res) => {
        this.listaClientes = [...res];
        this.sincronizarEstadosActivos(res);
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
      },
    });
  }

  sincronizarEstadosActivos(clientes: Cliente[]) {
    clientes.forEach((cliente) => {
      const vencimiento = this.calcularVencimiento(cliente);
      const caducado = this.esFechaPasada(vencimiento);
      const debeEstarActivo = !caducado;

      // Solo actualizamos Firebase si el estado guardado es distinto al real calculado
      if (cliente.id && cliente.activo !== debeEstarActivo) {
        this._clientesService.updateCliente(cliente.id, { activo: debeEstarActivo });
      }
    });
  }

  // --- MÉTODOS DE APOYO ---

  getNombreTarifa(id: string): string {
    const tarifa = this.listaTarifas.find((t) => t.id === id);
    return tarifa ? tarifa.nombre : 'Sin tarifa';
  }

  calcularVencimiento(cliente: any): Date | null {
    if (!cliente.fechaAlta || !cliente.tarifaId) return null;
    const tarifa = this.listaTarifas.find((t) => t.id === cliente.tarifaId);
    if (!tarifa) return null;

    const fechaAlta = cliente.fechaAlta?.toDate
      ? cliente.fechaAlta.toDate()
      : new Date(cliente.fechaAlta);
    const fechaVencimiento = new Date(fechaAlta);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + (tarifa.duracionDias || 30));
    return fechaVencimiento;
  }

  esFechaPasada(fechaVencimiento: Date | null): boolean {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaVencimiento < hoy;
  }

  // --- ACCIONES ---

  abrirModal() {
    this.formCliente.reset({
      nombre: '',
      apellidos: '',
      dni: '',
      telefono: '',
      tarifaId: '',
      formaPago: 'Efectivo',
      fechaAlta: new Date(),
      activo: true,
    });
    this.f['dni'].enable(); // Aseguramos que el DNI sea editable para nuevos socios
    this.mostrarModal = true;
  }

  async verDetalle(cliente: any) {
    // Convertir Timestamp de Firebase a Date de JS para el formulario
    const data = { ...cliente };
    if (data.fechaAlta && typeof data.fechaAlta.toDate === 'function') {
      data.fechaAlta = data.fechaAlta.toDate();
    }

    this.formCliente.patchValue(data);
    this.f['dni'].disable(); // El DNI no se puede modificar al editar
    this.clienteSeleccionado = cliente; // Mantenemos referencia por si acaso

    this.ultimoPago = null; // Reseteamos mientras carga

    // Mostramos el modal ANTES de la llamada asíncrona para evitar problemas de renderizado
    this.mostrarDetalle = true;

    // Buscamos el último pago
    if (cliente.id) {
      this.ultimoPago = await this._pagosService.getUltimoPago(cliente.id);
      // Forzamos la detección de cambios para asegurar que la vista se actualiza
      // con la información del último pago.
      this.cd.detectChanges();
    }
  }

  async registrarCobro(cliente: any) {
    const tarifa = this.listaTarifas.find((t) => t.id === cliente.tarifaId);

    // Verificación de seguridad
    if (!tarifa) {
      Swal.fire('Error', 'El cliente no tiene una tarifa válida asignada', 'error');
      return;
    }

    const importe = tarifa.precio || 0;

    const confirmacion = await Swal.fire({
      title: '¿Registrar cobro?',
      text: `Importe: ${importe}€. Se renovará el acceso desde hoy.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Pago',
      confirmButtonColor: '#81c784',
      target: 'body',
    });

    if (confirmacion.isConfirmed) {
      try {
        // 1. REGISTRO EN PAGOS (Esperamos a que termine antes de seguir)
        await this._pagosService.registrarPago({
          clienteId: cliente.id || '',
          clienteNombre: `${cliente.nombre} ${cliente.apellidos}`,
          importe: importe,
          tarifaNombre: tarifa.nombre || 'General',
          metodoPago: cliente.formaPago || 'Efectivo',
        });

        // 2. ACTUALIZACIÓN DE SOCIO (Cambiamos la fecha de alta)
        await this._clientesService.updateCliente(cliente.id, {
          fechaAlta: new Date(),
          activo: true, // Al pagar, el socio vuelve a estar activo inmediatamente
        });

        // 3. ÉXITO
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Pago registrado en el historial y socio renovado.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          target: 'body',
        });

        // 4. RECARGA DE DATOS
        this.cargarDatosIniciales();
      } catch (error) {
        console.error('Fallo total en la operación:', error);
        Swal.fire('Error', 'No se pudo completar el registro del pago.', 'error');
      }
    }
  }

  async guardarCliente() {
    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      return;
    }

    const datos = this.formCliente.value;

    // Verificamos si el DNI ya existe antes de guardar
    const existe = await this._clientesService.checkDniExists(datos.dni);
    if (existe) {
      this.f['dni'].setErrors({ dniDuplicado: true });
      return;
    }

    delete datos.id; // No enviamos el ID al crear

    try {
      // 1. Creamos el cliente y obtenemos la referencia para saber su ID
      const res = await this._clientesService.addCliente(datos);

      // 2. Registramos el pago inicial
      const tarifa = this.listaTarifas.find((t) => t.id === datos.tarifaId);
      if (tarifa) {
        await this._pagosService.registrarPago({
          clienteId: res.id, // El ID generado por Firebase
          clienteNombre: `${datos.nombre} ${datos.apellidos}`,
          importe: tarifa.precio || 0,
          tarifaNombre: tarifa.nombre || 'General',
          metodoPago: datos.formaPago || 'Efectivo',
        });
      }

      this.mostrarModal = false;
      this.cargarDatosIniciales();
      Swal.fire({ title: 'Socio Creado', icon: 'success', target: 'body' });
    } catch (e) {
      Swal.fire({ title: 'Error', text: 'No se pudo guardar', icon: 'error', target: 'body' });
    }
  }

  async actualizarCliente() {
    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Revisa los campos obligatorios.',
        icon: 'warning',
        target: 'body',
      });
      return;
    }

    const datos = this.formCliente.getRawValue(); // Usamos getRawValue para incluir campos deshabilitados
    const id = datos.id;

    await this._clientesService.updateCliente(id, datos);
    this.mostrarDetalle = false;
    this.cargarDatosIniciales();
    Swal.fire({ title: 'Actualizado', icon: 'success', target: 'body' });
  }

  async eliminarCliente(cliente: any) {
    const res = await Swal.fire({
      title: '¿Eliminar socio?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      target: 'body',
    });
    if (res.isConfirmed) {
      try {
        await this._clientesService.deleteCliente(cliente.id);

        await Swal.fire({
          title: 'Eliminado',
          text: 'El socio ha sido borrado correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          target: 'body',
        });

        this.cargarDatosIniciales();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar al socio.', 'error');
      }
    }
  }
}
