import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { LucideAngularModule, Mail, User, Lock, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showError = false;

  readonly Mail = Mail;
  readonly User = User;
  readonly Lock = Lock;
  readonly AlertCircle = AlertCircle;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showError = false;

    const { email, username, password } = this.registerForm.value;

    this.authService.register({ email, username, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Не удалось зарегистрироваться. Попробуйте снова.';
        }
        this.showError = true;
      }
    });
  }

  onErrorClosed(): void {
    this.showError = false;
  }

  get email() {
    return this.registerForm.get('email');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      const labels: any = {
        email: 'Email обязателен',
        username: 'Username обязателен',
        password: 'Пароль обязателен',
        confirmPassword: 'Подтверждение обязательно'
      };
      return labels[fieldName] || 'Поле обязательно';
    }
    if (field.errors['email']) {
      return 'Некорректный email';
    }
    if (field.errors['minlength']) {
      return fieldName === 'username' ? 'Минимум 3 символа' : 'Минимум 8 символов';
    }
    if (field.errors['maxlength']) {
      return 'Максимум 30 символов';
    }
    if (field.errors['pattern']) {
      return 'Только буквы, цифры, _ и -';
    }
    if (field.errors['passwordMismatch']) {
      return 'Пароли не совпадают';
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

