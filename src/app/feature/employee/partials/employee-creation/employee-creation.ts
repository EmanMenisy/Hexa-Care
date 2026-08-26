import { Component, signal } from '@angular/core';
import { EmployeeCreationStepper } from "../employee-creation-stepper/employee-creation-stepper";

@Component({
  selector: 'hexa-employee-creation',
  imports: [EmployeeCreationStepper],
  templateUrl: './employee-creation.html',
  styleUrl: './employee-creation.scss',
})
export class EmployeeCreation {
  steps = signal([
    { label: 'personal info', subtitle: 'Personal details' },
    { label: 'Professional', subtitle: 'Experience & skills' },
    { label: 'Schedule', subtitle: 'Working hours' },
    { label: 'Documents', subtitle: 'Attachments' },
  ]);

  step = signal(1);
  completedSteps = signal<boolean[]>([false, false, false, false]);

  get isLastStep(): boolean {
    return this.step() === this.steps().length;
  }

  onCancel(): void {
    // TODO: رجوع للصفحة اللي قبل، أو reset للفورم
  }

  onNext(): void {
    if (this.isLastStep) return;

    const completed = [...this.completedSteps()];
    completed[this.step() - 1] = true;
    this.completedSteps.set(completed);

    this.step.set(this.step() + 1);
  }

  onSave(): void {
    // TODO: نداء الـ API بتاع الحفظ النهائي
  }
}