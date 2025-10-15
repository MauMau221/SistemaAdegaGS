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
  selector: 'app-admin-layout',
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
  ],
  template: `
    <mat-sidenav-container class="admin-container">
      <mat-sidenav mode="side" opened class="admin-sidenav">
        <div class="sidenav-header">
          <h2>Painel Admin</h2>
        </div>
        
        <mat-nav-list>
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <a mat-list-item routerLink="/admin/produtos" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Produtos</span>
          </a>

          <a mat-list-item routerLink="/admin/categorias" routerLinkActive="active">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Categorias</span>
          </a>

          <a mat-list-item routerLink="/admin/usuarios" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Usuários</span>
          </a>

          <a mat-list-item routerLink="/admin/relatorios" routerLinkActive="active">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>Relatórios</span>
          </a>

          <a mat-list-item routerLink="/admin/configuracoes" routerLinkActive="active">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Configurações</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <button mat-button (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            Sair
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>{{pageTitle}}</span>
          <span class="toolbar-spacer"></span>
          <span class="user-info">{{userName}}</span>
        </mat-toolbar>

        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-container {
      height: 100vh;
      background-color: #f5f5f5;
    }

    .admin-sidenav {
      width: 250px;
      background-color: #fff;
      border-right: 1px solid #ddd;
    }

    .sidenav-header {
      padding: 16px;
      text-align: center;
      background-color: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }

    .sidenav-header h2 {
      margin: 0;
      font-size: 1.2em;
      color: #333;
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 16px;
      border-top: 1px solid #ddd;
    }

    .sidenav-footer button {
      width: 100%;
      justify-content: flex-start;
    }

    mat-toolbar {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .user-info {
      font-size: 0.9em;
      margin-right: 16px;
    }

    .admin-content {
      padding: 20px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .active {
      background-color: #f5f5f5;
      border-left: 4px solid #3f51b5;
    }

    mat-nav-list a {
      height: 48px;
    }

    mat-nav-list mat-icon {
      margin-right: 16px;
    }
  `]
})
export class AdminLayoutComponent {
  userName = '';
  pageTitle = 'Dashboard';

  constructor(private authService: AuthService) {
    const user = this.authService.getUser();
    this.userName = user?.name || 'Admin';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        window.location.href = '/login';
      }
    });
  }
}
