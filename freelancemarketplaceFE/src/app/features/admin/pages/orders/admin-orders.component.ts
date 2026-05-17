import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import {
  AssignFreelancerDialogComponent,
  AssignFreelancerDialogData,
} from '../../components/assign-freelancer-dialog/assign-freelancer-dialog.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
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
  readonly displayedColumns = ['id', 'client', 'freelancer', 'status', 'actions'];

  readonly statusOptions = [
    { label: 'All', value: 'ALL' },
    ...Object.values(OrderStatus).map((s) => ({ label: s.replace('_', ' '), value: s })),
  ];

  readonly filteredOrders = computed(() => {
    const status = this.statusControl.value;
    if (status === 'ALL') return this.orders();
    return this.orders().filter((o) => o.status === status);
  });

  openOrder(order: Order): void {
    void this.router.navigate(['/admin/orders', order.id]);
  }

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

  openAssign(order: Order): void {
    const ref = this.dialog.open(AssignFreelancerDialogComponent, {
      width: '420px',
      data: { orderId: order.id } satisfies AssignFreelancerDialogData,
    });

    ref.afterClosed().subscribe((freelancerId: number | undefined) => {
      if (!freelancerId) return;
      this.orderApi.assignFreelancer(order.id, freelancerId).subscribe({
        next: () => {
          this.snackBar.open('Freelancer assigned', 'Close', { duration: 2500 });
          this.loadOrders();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.error ?? 'Assign failed', 'Close', { duration: 4000 });
        },
      });
    });
  }

  private loadOrders(): void {
    this.orderApi.getAdminOrders().subscribe({
      next: (orders) => this.orders.set(orders),
    });
  }
}
