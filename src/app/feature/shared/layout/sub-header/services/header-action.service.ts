import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderActionService {
  private actionSubject = new Subject<string>();

  // Observable for components to subscribe to
  action$ = this.actionSubject.asObservable();

  // Method to trigger actions
  triggerAction(action: string) {
    this.actionSubject.next(action);
  }
}
