import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../toast/toast';
import { ToastType } from '../../../models/enums/toast-type';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  handleHttpError(error: unknown): string {
    let errorMessage: string;
    let errorDescription = '';

    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // Client-side / network error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorDescription =
          error.error?.errors?.[0]?.description ?? '';

        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request';
            break;

          case 401:
            errorMessage = 'Unauthorized';
             this.router.navigate(['/login']);
            break;

          case 403:
            errorMessage = 'Forbidden';
            this.router.navigate(['/access-denied']);
            break;

          case 404:
            errorMessage = 'Not Found';
            break;

          case 408:
            errorMessage = 'Request Timeout';
            break;

          case 500:
            errorMessage = 'Internal Server Error';
            break;

          case 502:
            errorMessage = 'Bad Gateway';
            break;

          case 503:
            errorMessage = 'Service Unavailable';
            break;

          case 504:
            errorMessage = 'Gateway Timeout';
            break;

          default:
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            break;
        }
      }
    } else {
      errorMessage = String(error);
    }

    this.toastService.clear();

    this.toastService.addToast(
      ToastType.ERROR,
      errorMessage,
      errorDescription,
      undefined,
      true,
      false
    );

    return errorMessage;
  }

  handleBusinessError(errorMessage?: string): void {
    this.toastService.clear();

    this.toastService.addToast(
      ToastType.ERROR,
      errorMessage ?? '',
      '',
      {},
      true,
      false
    );
  }
}