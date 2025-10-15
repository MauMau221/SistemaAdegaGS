import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-layout',
  templateUrl: './employee-layout.component.html',
  styleUrls: ['./employee-layout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class EmployeeLayoutComponent {
  menuItems = [
    { path: '/funcionario/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/funcionario/caixa', icon: 'point_of_sale', label: 'Caixa' },
    { path: '/funcionario/pedidos', icon: 'receipt_long', label: 'Pedidos' },
    { path: '/funcionario/estoque', icon: 'inventory_2', label: 'Estoque' }
  ];

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout().subscribe(() => {
      // O redirecionamento é feito pelo interceptor
    });
  }
}