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
      font-weight: 600;
      font-size: 12px;
      border: 1px solid transparent;
    }
    .pending {
      background: rgba(245, 158, 11, 0.15) !important;
      color: #fbbf24 !important;
      border-color: rgba(245, 158, 11, 0.35);
    }
    .assigned {
      background: rgba(162, 81, 235, 0.15) !important;
      color: #c084fc !important;
      border-color: rgba(162, 81, 235, 0.35);
    }
    .in-progress {
      background: rgba(160, 118, 193, 0.2) !important;
      color: #d8b4fe !important;
      border-color: rgba(160, 118, 193, 0.4);
    }
    .done,
    .approved {
      background: rgba(34, 197, 94, 0.15) !important;
      color: #4ade80 !important;
      border-color: rgba(34, 197, 94, 0.35);
    }
    .rejected {
      background: rgba(239, 68, 68, 0.15) !important;
      color: #f87171 !important;
      border-color: rgba(239, 68, 68, 0.35);
    }
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
