import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { FR_ERR, FR_SNACK, frOrderStatus } from '../../../../../core/i18n/fr-labels';
import { Order, OrderStatus, AssignFreelancerRequest } from '../../../../../core/models/order.model';
import { OrderApiService } from '../../../../../core/services/api/order-api.service';
import { applyOrderStatus, bindOrderFromRoute } from '../../../../../core/utils/order-route-loader';
import { AdminOrderMessagesComponent } from '../../../components/admin-order-messages/admin-order-messages.component';
import {
  AssignFreelancerDialogComponent,
  AssignFreelancerDialogData,
} from '../../../components/assign-freelancer-dialog/assign-freelancer-dialog.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatusChipComponent,
    AdminOrderMessagesComponent,
  ],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.scss',
})
export class AdminOrderDetailComponent {
  private readonly orderApi = inject(OrderApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly statusControl = new FormControl<OrderStatus | null>(null);

  readonly statusOptions: OrderStatus[] = Object.values(OrderStatus);
  readonly frOrderStatus = frOrderStatus;

  constructor() {
    bindOrderFromRoute({
      order: this.order,
      loading: this.loading,
      onLoaded: (order) => applyOrderStatus(order, this.statusControl),
    });
  }

  openAssign(): void {
    const order = this.order();
    if (!order) return;

    const ref = this.dialog.open(AssignFreelancerDialogComponent, {
      width: '420px',
      data: { orderId: order.id } satisfies AssignFreelancerDialogData,
    });

    ref.afterClosed().subscribe((request: AssignFreelancerRequest | undefined) => {
      if (!request) return;
      this.orderApi.assignFreelancer(order.id, request).subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.statusControl.setValue(updated.status);
          this.snackBar.open(FR_SNACK.freelancerAssigned, FR_SNACK.close, { duration: 2500 });
        },
        error: (err) => {
          this.snackBar.open(err?.error?.error ?? FR_ERR.assignFailed, FR_SNACK.close, { duration: 4000 });
        },
      });
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
        this.snackBar.open(FR_SNACK.statusUpdated, FR_SNACK.close, { duration: 2500 });
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error ?? FR_ERR.statusUpdateFailed, FR_SNACK.close, { duration: 4000 });
      },
    });
  }
}
