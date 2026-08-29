import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationLogic {
  private idSubject = new BehaviorSubject<string | null>(null);
  id$ = this.idSubject.asObservable();

  private currentStepSubject = new BehaviorSubject<number | null>(null);
  currentStep$ = this.currentStepSubject.asObservable();

  private start = new BehaviorSubject<number | null>(null);
  start$ = this.start.asObservable();

  private onSave = new BehaviorSubject<boolean>(false);
  onSave$ = this.onSave.asObservable();

  setStart(value: number): void {
    this.start.next(value);
    this.currentStepSubject.next(value);
  }
  goNext(): void {
    const prev = this.currentStepSubject.value ? this.currentStepSubject.value + 1 : null;
    this.currentStepSubject.next(prev);
  }
  setOnSave(value: boolean) {
    this.onSave.next(value);
  }
  setId(id: string | null): void {
    this.idSubject.next(id);
  }
}
