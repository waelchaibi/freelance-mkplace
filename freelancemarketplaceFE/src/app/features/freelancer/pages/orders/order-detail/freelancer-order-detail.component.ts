import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { FR_ERR, FR_SNACK, frOrderStatus } from '../../../../../core/i18n/fr-labels';
import { Order, OrderStatus } from '../../../../../core/models/order.model';
import { OrderApiService } from '../../../../../core/services/api/order-api.service';
import { applyOrderStatus, bindOrderFromRoute } from '../../../../../core/utils/order-route-loader';
import {
  OrderProgressDialogComponent,
  OrderProgressDialogData,
} from '../../../../../shared/components/order-progress-dialog/order-progress-dialog.component';
import { OrderMessagesComponent } from '../../../../../shared/components/order-messages/order-messages.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-freelancer-order-detail',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
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
  private readonly dialog = inject(MatDialog);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly statusControl = new FormControl<OrderStatus | null>(null);

  readonly statusOptions: OrderStatus[] = [
    OrderStatus.ASSIGNED,
    OrderStatus.IN_PROGRESS,
    OrderStatus.DONE,
  ];
  readonly frOrderStatus = frOrderStatus;

  constructor() {
    bindOrderFromRoute({
      order: this.order,
      loading: this.loading,
      onLoaded: (order) => applyOrderStatus(order, this.statusControl),
    });
  }

  openProgressDialog(): void {
    const order = this.order();
    if (!order) return;

    const ref = this.dialog.open(OrderProgressDialogComponent, {
      width: '400px',
      data: { currentProgress: order.progressPercent } satisfies OrderProgressDialogData,
    });

    ref.afterClosed().subscribe((progressPercent: number | undefined) => {
      if (progressPercent == null) return;
      this.orderApi.updateProgress(order.id, { progressPercent }).subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.statusControl.setValue(updated.status);
          this.snackBar.open(FR_SNACK.progressUpdated, FR_SNACK.close, { duration: 2500 });
        },
        error: (err) => {
          this.snackBar.open(err?.error?.error ?? FR_ERR.updateFailed, FR_SNACK.close, { duration: 4000 });
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
