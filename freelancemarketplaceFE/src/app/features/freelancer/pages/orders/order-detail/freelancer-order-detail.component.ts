import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../../../core/models/order.model';
import { OrderApiService } from '../../../../../core/services/api/order-api.service';
import { applyOrderStatus, bindOrderFromRoute } from '../../../../../core/utils/order-route-loader';
import { OrderMessagesComponent } from '../../../../../shared/components/order-messages/order-messages.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-freelancer-order-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatusChipComponent,
    OrderMessagesComponent,
  ],
  templateUrl: './freelancer-order-detail.component.html',
  styleUrl: './freelancer-order-detail.component.scss',
})
export class FreelancerOrderDetailComponent {
  private readonly orderApi = inject(OrderApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly statusControl = new FormControl<OrderStatus | null>(null);

  readonly statusOptions: OrderStatus[] = [
    OrderStatus.ASSIGNED,
    OrderStatus.IN_PROGRESS,
    OrderStatus.DONE,
  ];

  constructor() {
    bindOrderFromRoute({
      order: this.order,
      loading: this.loading,
      onLoaded: (order) => applyOrderStatus(order, this.statusControl),
    });
  }

  updateStatus(): void {
    const order = this.order();
    const status = this.statusControl.value;
    if (!order || !status) return;

    this.orderApi.updateStatus(order.id, status).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.statusControl.setValue(updated.status);
        this.snackBar.open('Order status updated', 'Close', { duration: 2500 });
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error ?? 'Status update failed', 'Close', { duration: 4000 });
      },
    });
  }
}
