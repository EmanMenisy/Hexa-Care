import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';

@Component({
  selector: 'hexa-creation-stepper',
  imports: [CommonModule],
  templateUrl: './employee-creation-stepper.html',
  styleUrl: './employee-creation-stepper.scss',
})
export class EmployeeCreationStepper {
steps = input<{ label: string; subtitle: string }[]>([]);
  step = model<number>(1);
  completedSteps = input<boolean[]>([]);

  goToStep(i: number) {
    if (this.completedSteps()[i] || i + 1 === this.step()) {
      this.step.set(i + 1);
    }
  }
}
