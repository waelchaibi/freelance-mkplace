import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FR_ERR, FR_SNACK, frOrderStatus } from '../../../../core/i18n/fr-labels';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import {
  AdminOrderFormDialogComponent,
  AdminOrderFormDialogData,
} from '../../components/order-form-dialog/admin-order-form-dialog.component';
import {
  AssignOrderWizardDialogComponent,
  AssignOrderWizardDialogData,
} from '../../components/assign-order-wizard-dialog/assign-order-wizard-dialog.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly orders = signal<Order[]>([]);
  readonly statusControl = new FormControl<string>('ALL', { nonNullable: true });
  readonly displayedColumns = ['id', 'title', 'client', 'freelancer', 'status', 'deadline', 'actions'];

  readonly statusOptions = [
    { label: 'Tous', value: 'ALL' },
    ...Object.values(OrderStatus).map((s) => ({ label: frOrderStatus(s), value: s })),
  ];

  readonly filteredOrders = computed(() => {
    const status = this.statusControl.value;
    if (status === 'ALL') return this.orders();
    return this.orders().filter((o) => o.status === status);
  });

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status') ?? 'ALL';
    this.statusControl.setValue(status, { emitEvent: false });

    this.statusControl.valueChanges.subscribe((value) => {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { status: value === 'ALL' ? null : value },
        queryParamsHandling: 'merge',
      });
    });

    this.loadOrders();
  }

  openOrder(order: Order): void {
    void this.router.navigate(['/admin/orders', order.id]);
  }

  openCreate(): void {
    const ref = this.dialog.open(AdminOrderFormDialogComponent, {
      width: '520px',
      data: { order: null } satisfies AdminOrderFormDialogData,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(FR_SNACK.projectCreated, FR_SNACK.close, { duration: 2500 });
        this.loadOrders();
      }
    });
  }

  openEdit(order: Order): void {
    const ref = this.dialog.open(AdminOrderFormDialogComponent, {
      width: '520px',
      data: { order } satisfies AdminOrderFormDialogData,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(FR_SNACK.projectUpdated, FR_SNACK.close, { duration: 2500 });
        this.loadOrders();
      }
    });
  }

  openAssignWizard(): void {
    const ref = this.dialog.open(AssignOrderWizardDialogComponent, {
      width: '480px',
      data: { orders: this.orders() } satisfies AssignOrderWizardDialogData,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(FR_SNACK.freelancerAssigned, FR_SNACK.close, { duration: 2500 });
        this.loadOrders();
      }
    });
  }

  deleteOrder(order: Order): void {
    if (!confirm(`Supprimer le projet #${order.id} ?`)) return;
    this.orderApi.delete(order.id).subscribe({
      next: () => {
        this.snackBar.open(FR_SNACK.projectDeleted, FR_SNACK.close, { duration: 2500 });
        this.loadOrders();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error ?? FR_ERR.deleteFailed, FR_SNACK.close, { duration: 4000 });
      },
    });
  }

  private loadOrders(): void {
    this.orderApi.getAdminOrders().subscribe({
      next: (orders) => this.orders.set(orders),
    });
  }
}
