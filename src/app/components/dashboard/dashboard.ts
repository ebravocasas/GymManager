import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { Clientes } from '../../services/clientes';
import { Tarifas } from '../../services/tarifas';
import { Pagos } from '../../services/pagos';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, DialogModule, TableModule, ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  private _clientesService = inject(Clientes);
  private _tarifasService = inject(Tarifas);
  private _pagosService = inject(Pagos);
  private cd = inject(ChangeDetectorRef);

  fechaActual: Date = new Date();
  horaActual: Date = new Date();
  totalActivos: number = 0;
  totalInactivos: number = 0;
  listaInactivos: any[] = [];
  mostrarInactivos: boolean = false;
  private timerId: any;
  private listaTarifas: any[] = [];

  ngOnInit(): void {
    // Cargamos tarifas primero para poder calcular vencimientos correctamente
    this._tarifasService.getTarifas().subscribe((tarifas) => {
      this.listaTarifas = tarifas;
      this.obtenerEstadisticas();
    });

    // Actualizamos el reloj cada segundo
    this.timerId = setInterval(() => {
      this.horaActual = new Date();
      this.cd.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  obtenerEstadisticas() {
    this._clientesService.getClientes().subscribe((clientes) => {
      let activos = 0;
      let inactivos = 0;
      const tempInactivos: any[] = [];

      clientes.forEach((c) => {
        const vencimiento = this.calcularVencimiento(c);
        const caducado = this.esFechaPasada(vencimiento);
        const debeEstarActivo = !caducado;

        if (debeEstarActivo) {
          activos++;
        } else {
          inactivos++;
          tempInactivos.push(c);
        }

        // Sincronización silenciosa con Firebase si el dato está desfasado
        if (c.id && c.activo !== debeEstarActivo) {
          this._clientesService.updateCliente(c.id, { activo: debeEstarActivo });
        }
      });

      this.totalActivos = activos;
      this.totalInactivos = inactivos;
      this.listaInactivos = tempInactivos;
      this.cd.detectChanges(); // Forzamos a Angular a actualizar la vista
    });
  }

  private calcularVencimiento(cliente: any): Date | null {
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

  private esFechaPasada(fechaVencimiento: Date | null): boolean {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaVencimiento < hoy;
  }

  async registrarCobro(cliente: any) {
    const tarifa = this.listaTarifas.find((t) => t.id === cliente.tarifaId);
    if (!tarifa) {
      Swal.fire({
        title: 'Error',
        text: 'El cliente no tiene una tarifa válida',
        icon: 'error',
        target: 'body',
      });
      return;
    }

    // Cerramos el modal de la lista para evitar conflictos visuales
    this.mostrarInactivos = false;
    this.cd.detectChanges();

    const confirmacion = await Swal.fire({
      title: '¿Renovar socio?',
      text: `Se registrará un pago de ${tarifa.precio}€ para ${cliente.nombre}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Pago',
      target: 'body',
    });

    if (confirmacion.isConfirmed) {
      try {
        await this._pagosService.registrarPago({
          clienteId: cliente.id,
          clienteNombre: `${cliente.nombre} ${cliente.apellidos}`,
          importe: tarifa.precio,
          tarifaNombre: tarifa.nombre,
          metodoPago: cliente.formaPago || 'Efectivo',
        });

        await this._clientesService.updateCliente(cliente.id, {
          fechaAlta: new Date(),
          activo: true,
        });

        Swal.fire({
          title: '¡Renovado!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          target: 'body',
        });

        // Refrescamos las estadísticas para que los contadores y la lista se actualicen
        this.obtenerEstadisticas();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo procesar el pago',
          icon: 'error',
          target: 'body',
        });
      }
    } else {
      // Si el usuario cancela, volvemos a mostrar la lista
      this.mostrarInactivos = true;
    }
  }

  async eliminarCliente(cliente: any) {
    // Cerramos el modal de la lista PRIMERO para que la confirmación se vea bien
    this.mostrarInactivos = false;
    this.cd.detectChanges();

    const res = await Swal.fire({
      title: '¿Eliminar socio?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      target: 'body',
    });

    if (res.isConfirmed) {
      try {
        await this._clientesService.deleteCliente(cliente.id);
        // Actualizamos los datos del dashboard
        this.obtenerEstadisticas();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar al socio',
          icon: 'error',
          target: 'body',
        });
      }
    } else {
      // Si cancela la eliminación, reabrimos la lista
      this.mostrarInactivos = true;
    }
  }
}
