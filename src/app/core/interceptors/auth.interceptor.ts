import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Токен теперь в HttpOnly cookie, отправляется автоматически с withCredentials: true
  // Interceptor теперь только обрабатывает ошибки аутентификации
  
  // Клонируем запрос для добавления заголовка безопасности
  const authReq = req.clone({
    headers: req.headers.set('X-App-Source', 'helloitsme-client')
  });
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Неавторизован - редирект на логин
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};

