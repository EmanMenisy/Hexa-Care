import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpMethod } from '../../../models/enums/http-method';
import { Localization } from '../../localization/localization';
import { ConnectionService } from '../connection/connection';
import { ToastType } from '../../../models/enums/toast-type';
import { ToastService } from '../../toast/toast';
import { environment } from '../../../../../environments/environment.development';
import { ErrorHandlerService } from '../Error-handler/error-handler';
interface XhrOptions {
  url: string;
  method: HttpMethod;
  params?: HttpParams;
  headers?: HttpHeaders;
  body?: unknown;
  responseType?: 'json' | 'blob';
  isExternal?: boolean;
}

interface ApiResponse {
  isSuccess?: boolean;
  data?: unknown;
  message?: string;
  errorCode?: number;
}

type XhrObserver = {
  next?: (val: unknown) => void;
  error: (err: unknown) => void;
  complete?: () => void;
};

const ACCESS_DENIED_ERROR_CODE = 15;

@Injectable({
  providedIn: 'root',
})
export class XhrService {
  // ────────────────────────────────
  // Dependencies
  // ────────────────────────────────
  private readonly http = inject(HttpClient);
  private readonly connectionService = inject(ConnectionService);
  private readonly localization = inject(Localization);
  private readonly toastService = inject(ToastService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  // ────────────────────────────────
  // Config
  // ────────────────────────────────
  private readonly baseUrl = environment.backendUrl; 

  private readonly defaultOptions = {
    responseType: 'json' as const,
    withCredentials: true,
  };

  /**
   * LanguageCode must reflect the currently selected language,
   * which can change at runtime.
   */
  private get defaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Time-Zone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      LanguageCode: this.localization.selectedLang() ?? 'en',
    });
  }

  // ────────────────────────────────
  // Request preparation
  // ────────────────────────────────

  private getFinalRequestOptions(options: XhrOptions) {
    const requestOptions = {
      ...this.defaultOptions,
      ...options,
    };

    let headers = this.mergeHeaders(this.defaultHeaders, options.headers);

    if (options.isExternal) {
      headers = headers.set('isExternal', 'true');
    }

    const isFileUpload = requestOptions.body instanceof FormData;
    if (isFileUpload) {
      headers = headers.delete('Content-Type');
    }

    if (requestOptions.responseType === 'blob') {
      headers = headers.set('Accept', '*/*');
    }

    return { ...requestOptions, headers };
  }

  private mergeHeaders(defaultHeaders: HttpHeaders, requestHeaders?: HttpHeaders): HttpHeaders {
    if (!requestHeaders) {
      return defaultHeaders;
    }

    let headers = defaultHeaders;
    requestHeaders.keys().forEach((key) => {
      headers = headers.set(key, requestHeaders.get(key) ?? '');
    });

    return headers;
  }

  public createUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.baseUrl}${url}`;
  }

  // ────────────────────────────────
  // HTTP request
  // ────────────────────────────────

  public call(params: XhrOptions): Observable<any> {
    return new Observable((observer) => {
      if (!this.connectionService.connected()) {
        this.handleNoConnection(observer);
        return;
      }

      const finalRequest = this.getFinalRequestOptions(params);
      const url = this.createUrl(finalRequest.url);

      const req = new HttpRequest(finalRequest.method, url, finalRequest.body, {
        headers: finalRequest.headers,
        params: finalRequest.params,
        responseType: finalRequest.responseType,
        withCredentials: true,
      });

      this.http.request(req).subscribe({
        next: (event: HttpEvent<unknown>) => this.handleHttpEvent(event, observer),
        error: (error: unknown) => this.handleHttpError(error, observer),
      });
    });
  }

  // ────────────────────────────────
  // Response / error handling
  // ────────────────────────────────

  private handleNoConnection(observer: XhrObserver): void {
    this.toastService.addToast(
      ToastType.ERROR,
      this.localization.instant('No Connection'),
      '',
      undefined,
      true,
    );

    observer.error('No Connection');
    observer.complete?.();
  }

  private handleHttpEvent(event: HttpEvent<unknown>, observer: XhrObserver): void {
    if (event.type !== HttpEventType.Response) return;

    const body = event.body as ApiResponse | Blob | null;

    // FILE RESPONSE (CSV, PDF, EXCEL)
    if (body instanceof Blob) {
      observer.next?.(body);
      observer.complete?.();
      return;
    }

    if (body && typeof body.isSuccess === 'undefined') {
      observer.next?.(body);
      observer.complete?.();
      return;
    }

    // NORMAL JSON RESPONSE
    if (body?.isSuccess) {
      observer.next?.(body.data);
      observer.complete?.();
      
    } else {
      this.errorHandlerService.handleBusinessError(body?.message);
      if (body?.errorCode === ACCESS_DENIED_ERROR_CODE) {
        this.router.navigate(['/access-denied']);
      }
      observer.error(body?.errorCode);
    }
  }

  private handleHttpError(error: unknown, observer: XhrObserver): void {
    this.errorHandlerService.handleHttpError(error);
    observer.error(error);
  }
}