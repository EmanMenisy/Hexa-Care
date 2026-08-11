import { Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  readonly connected = signal(navigator.onLine);

  constructor() {
    fromEvent(window, 'online').subscribe(() => {
      this.connected.set(true);
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.connected.set(false);
    });
  }
}
