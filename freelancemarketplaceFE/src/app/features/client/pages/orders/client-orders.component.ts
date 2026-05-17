import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  templateUrl: './client-orders.component.html',
  styleUrl: './client-orders.component.scss',
})
export class ClientOrdersComponent implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly orders = signal<Order[]>([]);
  readonly statusControl = new FormControl<string>('ALL', { nonNullable: true });
  readonly displayedColumns = ['id', 'service', 'status', 'freelancer', 'actions'];

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
    void this.router.navigate(['/client/orders', order.id]);
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

    this.orderApi.getClientOrders().subscribe({
      next: (orders) => this.orders.set(orders),
    });
  }
}
