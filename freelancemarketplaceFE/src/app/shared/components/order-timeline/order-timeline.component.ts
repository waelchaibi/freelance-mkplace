import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OrderTimelineEvent } from '../../../core/models/order.model';
import { StatusChipComponent } from '../status-chip/status-chip.component';

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [DatePipe, MatIconModule, StatusChipComponent],
  templateUrl: './order-timeline.component.html',
  styleUrl: './order-timeline.component.scss',
})
export class OrderTimelineComponent {
  readonly events = input.required<OrderTimelineEvent[]>();
}
