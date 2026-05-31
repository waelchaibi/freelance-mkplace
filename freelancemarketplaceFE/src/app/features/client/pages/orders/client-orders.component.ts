import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { frOrderStatus } from '../../../../core/i18n/fr-labels';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
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
  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly statusControl = new FormControl<string>('ALL', { nonNullable: true });
  readonly displayedColumns = ['title', 'technology', 'status', 'deadline', 'freelancer', 'actions'];

  readonly statusOptions = [
    { label: 'Tous', value: 'ALL' },
    ...Object.values(OrderStatus).map((s) => ({ label: frOrderStatus(s), value: s })),
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
    const page = Number(this.route.snapshot.queryParamMap.get('page') ?? '0');
    this.statusControl.setValue(status, { emitEvent: false });
    this.pageIndex.set(page);

    this.statusControl.valueChanges.subscribe((value) => {
      this.pageIndex.set(0);
      void this.syncUrl();
      this.loadOrders();
    });

    this.loadOrders();
  }

  handlePage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    void this.syncUrl();
    this.loadOrders();
  }

  private syncUrl(): void {
    const value = this.statusControl.value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: value === 'ALL' ? null : value,
        page: this.pageIndex() || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private loadOrders(): void {
    this.orderApi.getClientOrdersPaged(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.orders.set(page.content);
        this.totalElements.set(page.totalElements);
      },
    });
  }
}
