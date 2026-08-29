import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-kpi-card',
  imports: [TranslatePipe],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
})
export class KpiCard {
  label = input.required<string>();
  value = input.required<number | string>();
  icon = input.required<string>();
  iconBg = input<string>('#eef2ff');
  trend = input<string>();
  trendLabel = input<string>();
}
