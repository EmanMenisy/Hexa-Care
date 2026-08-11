import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable } from 'rxjs';

import { ConnectionService } from '../API/connection/connection';
import { ErrorHandlerService } from '../API/Error-handler/error-handler';
import { ToastService } from '../toast/toast';
import { Localization } from '../localization/localization';
import { ToastType } from '../../models/enums/toast-type';
import { environment } from '../../../../environments/environment.development';

const HUB_ENDPOINT = '/dispatcherHub';

interface InvokeResponse {
  hasErrors: boolean;
  data?: unknown;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class XhrSocketService {
  private readonly connectionService = inject(ConnectionService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly toastService = inject(ToastService);
  private readonly localization = inject(Localization);

  public readonly connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.backendUrl}${HUB_ENDPOINT}`)
      .configureLogging(
        environment.production
          ? signalR.LogLevel.None
          : signalR.LogLevel.Information,
      )
      .withAutomaticReconnect([0, 10000, 10000, 30000, 60000, 180000])
      .build();
  }

  /**
   * Listen to a SignalR server event.
   * Note: app is zoneless — consumers must store incoming payloads
   * in a signal (not a plain property) for the UI to update.
   */
  on(eventName: string): Observable<unknown> {
    return new Observable((observer) => {
      const handler = (payload: unknown) => {
        observer.next(payload);
      };

      this.connection.on(eventName, handler);

      return () => {
        this.connection.off(eventName, handler);
      };
    });
  }

  /**
   * Invoke a method on the SignalR server.
   */
  invoke(methodName: string, params?: unknown): Observable<unknown> {
    return new Observable((observer) => {
      if (this.connection.state !== signalR.HubConnectionState.Connected) {
        observer.error('Not connected');
        return;
      }

      const invokePromise =
        params !== undefined
          ? this.connection.invoke(methodName, params)
          : this.connection.invoke(methodName);

      invokePromise
        .then((response: InvokeResponse) => {
          if (!response.hasErrors) {
            observer.next(response.data);
            return;
          }

          this.errorHandlerService.handleBusinessError(response.errors?.[0]);
          observer.error(response.errors);
        })
        .catch((error: unknown) => {
          this.errorHandlerService.handleHttpError(error);
          observer.error(error);
        })
        .finally(() => {
          observer.complete();
        });
    });
  }

  /**
   * Start the SignalR connection.
   */
  startSocketConnection(): Observable<boolean> {
    return new Observable((observer) => {
      // 1. Check internet connection
      if (!this.connectionService.connected()) {
        this.toastService.addToast(
          ToastType.ERROR,
          this.localization.instant('opus.toast.no_connection'),
          '',
          undefined,
          true,
        );

        observer.error('No internet connection');
        return;
      }

      // 2. Already connected / connecting / reconnecting
      if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
        observer.next(true);
        observer.complete();
        return;
      }

      // 3. Start SignalR connection
      this.connection
        .start()
        .then(() => {
          observer.next(true);
          observer.complete();
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);

          this.errorHandlerService.handleBusinessError(message);
          observer.error(error);
        });
    });
  }

  /**
   * Stop the SignalR connection.
   */
  closeConnection(): Observable<boolean> {
    return new Observable((observer) => {
      this.connection
        .stop()
        .then(() => {
          observer.next(true);
          observer.complete();
        })
        .catch((error: unknown) => {
          observer.error(error);
        });
    });
  }
}