import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { funcionarioGuard } from './core/guards/funcionario.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/pages/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'funcionario',
    loadComponent: () => import('./employee/components/employee-layout/employee-layout.component').then(m => m.EmployeeLayoutComponent),
    canActivate: [authGuard, funcionarioGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./employee/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'caixa',
        loadComponent: () => import('./employee/pages/caixa/caixa.component').then(m => m.CaixaComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./employee/pages/pedidos/pedidos.component').then(m => m.PedidosComponent)
      },
      {
        path: 'estoque',
        loadComponent: () => import('./employee/pages/estoque/estoque.component').then(m => m.EstoqueComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'produtos',
        loadComponent: () => import('./admin/pages/produtos/produtos.component').then(m => m.ProdutosComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./admin/pages/categorias/categorias.component').then(m => m.CategoriasComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./admin/pages/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./admin/pages/relatorios/relatorios.component').then(m => m.RelatoriosComponent)
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./admin/pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent)
      }
    ]
  }
];