import { KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-bars',
  standalone: true,
  imports: [KeyValuePipe],
  templateUrl: './stat-bars.component.html',
  styleUrl: './stat-bars.component.scss',
})
export class StatBarsComponent {
  readonly title = input.required<string>();
  readonly data = input.required<Record<string, number>>();

  maxValue(): number {
    const values = Object.values(this.data());
    return values.length ? Math.max(...values, 1) : 1;
  }

  barWidth(value: number): string {
    return `${(value / this.maxValue()) * 100}%`;
  }
}
