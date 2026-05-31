import { Component, input } from '@angular/core';
import { ActivityDataPoint } from '../../../core/models/admin-stats.model';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  templateUrl: './activity-chart.component.html',
  styleUrl: './activity-chart.component.scss',
})
export class ActivityChartComponent {
  readonly title = input('Activity (last 7 days)');
  readonly data = input.required<ActivityDataPoint[]>();

  maxValue(point: ActivityDataPoint): number {
    return Math.max(point.orders, point.messages, 1);
  }
}
