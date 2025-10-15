import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Capturar o returnUrl dos query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login bem sucedido:', response);
        // Redirecionar baseado no tipo de usuário
        const userType = response.user.type;
        let targetRoute = this.returnUrl;

        if (this.returnUrl === '/') {
          switch (userType) {
            case 'admin':
              targetRoute = '/admin';
              break;
            case 'employee':
              targetRoute = '/funcionario';
              break;
            case 'customer':
              targetRoute = '/';
              break;
          }
        }

        console.log('Redirecionando para:', targetRoute);
        this.router.navigate([targetRoute]).then(
          () => console.log('Navegação bem sucedida'),
          (err) => console.error('Erro na navegação:', err)
        );
      },
      error: (error) => {
        this.error = error.error.message || 'Erro ao fazer login';
        this.loading = false;
      }
    });
  }
}
