import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Pagos } from '../../services/pagos'; // Tu servicio

const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

@Component({
  selector: 'app-pagos-gestion',
  standalone: true,
  imports: [CommonModule, TableModule, DatePickerModule, ButtonModule, FormsModule],
  templateUrl: './pagos-gestion.html',
  styleUrl: './pagos-gestion.scss',
})
export class PagosGestion implements OnInit {
  private _pagosService = inject(Pagos);
  private cd = inject(ChangeDetectorRef);

  listaPagos: any[] = [];
  listaPagosFiltrada: any[] = [];
  hoy = new Date();

  // Filtros de fecha
  rangoFechas: Date[] | undefined;

  // Getter para mostrar el mes actual en español
  get nombreMesActual(): string {
    return NOMBRES_MESES[this.hoy.getMonth()];
  }

  ngOnInit() {
    this.obtenerPagos();
  }

  obtenerPagos() {
    this._pagosService.getHistorialPagos().subscribe({
      next: (res) => {
        // Convertimos los timestamps de Firebase a objetos Date reales
        this.listaPagos = res.map((pago) => ({
          ...pago,
          fechaDate: pago.fechaPago?.toDate ? pago.fechaPago.toDate() : new Date(pago.fechaPago),
        }));

        this.aplicarFiltroAnual();
        this.actualizarEstadisticaMesActual();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error:', err),
    });
  }

  aplicarFiltroAnual() {
    const añoActual = new Date().getFullYear();
    this.listaPagosFiltrada = this.listaPagos.filter(
      (pago) => pago.fechaDate.getFullYear() === añoActual,
    );
  }

  filtrarPorRango() {
    if (this.rangoFechas && this.rangoFechas[0] && this.rangoFechas[1]) {
      const inicio = this.rangoFechas[0];
      const fin = this.rangoFechas[1];
      fin.setHours(23, 59, 59); // Asegurar que incluimos todo el día final

      this.listaPagosFiltrada = this.listaPagos.filter(
        (pago) => pago.fechaDate >= inicio && pago.fechaDate <= fin,
      );
    } else if (!this.rangoFechas) {
      this.aplicarFiltroAnual();
    }
  }

  calcularTotalRecaudado(): number {
    if (!this.listaPagos || this.listaPagos.length === 0) return 0;

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    return this.listaPagosFiltrada
      .filter((pago) => {
        const fechaPago = pago.fechaDate;

        // Solo dejamos pasar los que coinciden con el mes y año en curso
        return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === añoActual;
      })
      .reduce((total, pago) => total + (Number(pago.importe) || 0), 0);
  }

  async actualizarEstadisticaMesActual() {
    const totalMes = this.calcularTotalRecaudado(); // Tu función que filtra por mes actual
    const hoy = new Date();

    try {
      await this._pagosService.guardarCierreEstadistico(
        hoy.getMonth(),
        hoy.getFullYear(),
        totalMes,
        NOMBRES_MESES[hoy.getMonth()],
      );
      console.log('Estadística mensual actualizada en Firebase');
    } catch (error) {
      console.error('Error al guardar estadística:', error);
    }
  }

  exportarCSV() {
    if (this.listaPagosFiltrada.length === 0) return;

    const headers = ['Fecha', 'Cliente', 'Tarifa', 'Importe', 'Metodo'];
    const rows = this.listaPagosFiltrada.map((p) => [
      p.fechaDate.toLocaleDateString(),
      p.clienteNombre,
      p.tarifaNombre,
      `${p.importe}€`,
      p.metodoPago,
    ]);

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_pagos_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  }

  limpiarFiltros() {
    this.rangoFechas = undefined;
    this.aplicarFiltroAnual();
  }
}
