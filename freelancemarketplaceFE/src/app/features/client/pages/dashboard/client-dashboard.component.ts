import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { ClientStats } from '../../../../core/models/dashboard-stats.model';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { DashboardStatsApiService } from '../../../../core/services/api/dashboard-stats-api.service';
import { FR_ERR } from '../../../../core/i18n/fr-labels';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    RouterLink,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit {
  private readonly statsApi = inject(DashboardStatsApiService);
  private readonly orderApi = inject(OrderApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly stats = signal<ClientStats | null>(null);
  readonly orders = signal<Order[]>([]);
  readonly recentOrders = computed(() => [...this.orders()].slice(0, 5));
  readonly displayedColumns = ['id', 'service', 'status', 'deadline', 'actions'];

  ngOnInit(): void {
    this.statsApi.getClientStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? FR_ERR.loadDashboard);
        this.loading.set(false);
      },
    });

    this.orderApi.getClientOrders().subscribe({
      next: (orders) => this.orders.set(orders),
    });
  }

  openOrder(order: Order): void {
    void this.router.navigate(['/client/orders', order.id]);
  }

  openMessages(): void {
    void this.router.navigate(['/client/messages']);
  }
}
