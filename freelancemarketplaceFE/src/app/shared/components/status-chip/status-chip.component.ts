import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { OrderStatus } from '../../../core/models/order.model';
import { ServiceStatus } from '../../../core/models/service.model';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatChipsModule],
  template: `<mat-chip [class]="chipClass()">{{ status() }}</mat-chip>`,
  styles: `
    mat-chip {
      font-weight: 500;
    }
    .pending { background: #fef3c7; color: #92400e; }
    .assigned { background: #dbeafe; color: #1e40af; }
    .in-progress { background: #e0e7ff; color: #3730a3; }
    .done { background: #dcfce7; color: #166534; }
    .approved { background: #dcfce7; color: #166534; }
  `,
})
export class StatusChipComponent {
  readonly status = input.required<OrderStatus | ServiceStatus | string>();

  chipClass(): string {
    return this.status().toLowerCase().replace('_', '-');
  }
}
