import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true, // Asegúrate de que sea standalone
  imports: [RouterOutlet, ButtonModule, RouterModule, MenubarModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  public authService = inject(AuthService);
  private router = inject(Router);

  private timeoutId: any;
  private readonly INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutos

  constructor() {
    this.resetTimer();
  }

  // Escucha actividad global para resetear el contador
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  @HostListener('document:wheel')
  resetTimer() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIME);
  }

  protected readonly title = signal('gym-manager-app');

  items: MenuItem[] = [
    { label: 'Clientes', icon: 'pi pi-users', routerLink: '/clientes' },
    { label: 'Tarifas', icon: 'pi pi-percentage', routerLink: '/tarifas' },
    { label: 'Configuración', icon: 'pi pi-cog' },
  ];

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
