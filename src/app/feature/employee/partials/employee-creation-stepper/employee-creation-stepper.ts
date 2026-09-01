import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hexa-creation-stepper',
  imports: [CommonModule , TranslatePipe],
  templateUrl: './employee-creation-stepper.html',
  styleUrl: './employee-creation-stepper.scss',
})
export class EmployeeCreationStepper {
  steps = input<{ label: string; subtitle: string }[]>([]);
  step = model<number>(1);
  completedSteps = input<boolean[]>([]);
  maxStep = input<number>(1);
  
 goToStep(i: number) {
  if (i + 1 <= this.maxStep()) {
    this.step.set(i + 1);
  }
}
}
