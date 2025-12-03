import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { LucideAngularModule, Mail, Lock, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    AuthLayoutComponent,
    ButtonComponent,
    NotificationComponent,
    LucideAngularModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showError = false;

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly AlertCircle = AlertCircle;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showError = false;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Неверный email или пароль';
        this.showError = true;
      }
    });
  }

  onErrorClosed(): void {
    this.showError = false;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return fieldName === 'email' ? 'Email обязателен' : 'Пароль обязателен';
    }
    if (field.errors['email']) {
      return 'Некорректный email';
    }
    if (field.errors['minlength']) {
      return 'Минимум 8 символов';
    }
    
    return '';
  }

  getInputClasses(fieldName: string): string {
    const baseClasses = 'w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-[12px] text-white placeholder:text-white/30 transition-all duration-200 focus:outline-none focus:border-violet-500/30 focus:bg-[#16161f]';
    const hasError = this.getFieldError(fieldName);
    
    if (hasError) {
      return `${baseClasses} border-red-500/50 focus:border-red-500 pr-10`;
    }
    
    return `${baseClasses} border-white/5`;
  }
}

