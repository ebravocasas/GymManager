import { Component, signal, inject } from '@angular/core';
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
