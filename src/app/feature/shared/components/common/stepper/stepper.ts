import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.scss']
})
export class StepperComponent {
  steps = input<{ label: string }[]>([]);
  step = input<number>(1);
  completedSteps = input<boolean[]>([]);

  stepChange = output<number>();

  goToStep(i: number) {
    if (this.completedSteps()[i] || i + 1 === this.step()) {
      this.stepChange.emit(i + 1);
    }
  }
}