import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { frOrderStatus, frServiceStatus } from '../../../core/i18n/fr-labels';
import { OrderStatus } from '../../../core/models/order.model';
import { ServiceStatus } from '../../../core/models/service.model';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatChipsModule],
  template: `<mat-chip [class]="chipClass()">{{ label() }}</mat-chip>`,
  styles: `
    mat-chip {
      font-weight: 500;
    }
    .pending { background: #fef3c7; color: #92400e; }
    .assigned { background: #dbeafe; color: #1e40af; }
    .in-progress { background: #e0e7ff; color: #3730a3; }
    .done { background: #dcfce7; color: #166534; }
    .approved { background: #dcfce7; color: #166534; }
    .rejected { background: #fee2e2; color: #991b1b; }
  `,
})
export class StatusChipComponent {
  readonly status = input.required<OrderStatus | ServiceStatus | string>();

  readonly label = computed(() => {
    const value = this.status();
    if (Object.values(OrderStatus).includes(value as OrderStatus)) {
      return frOrderStatus(value as OrderStatus);
    }
    if (Object.values(ServiceStatus).includes(value as ServiceStatus)) {
      return frServiceStatus(value as ServiceStatus);
    }
    return String(value);
  });

  chipClass(): string {
    return this.status().toLowerCase().replace('_', '-');
  }
}
