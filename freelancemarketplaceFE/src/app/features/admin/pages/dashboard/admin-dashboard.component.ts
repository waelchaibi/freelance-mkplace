import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { AdminStats } from '../../../../core/models/admin-stats.model';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { AdminStatsApiService } from '../../../../core/services/api/admin-stats-api.service';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { ActivityChartComponent } from '../../../../shared/components/activity-chart/activity-chart.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatBarsComponent } from '../../../../shared/components/stat-bars/stat-bars.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    RouterLink,
    PageHeaderComponent,
    StatBarsComponent,
    StatusChipComponent,
    ActivityChartComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly statsApi = inject(AdminStatsApiService);
  private readonly orderApi = inject(OrderApiService);
  private readonly router = inject(Router);

  readonly stats = signal<AdminStats | null>(null);
  readonly recentPending = signal<Order[]>([]);
  readonly displayedColumns = ['id', 'client', 'status', 'actions'];

  ngOnInit(): void {
    this.statsApi.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });

    this.orderApi.getAdminOrders().subscribe({
      next: (orders) => {
        this.recentPending.set(orders.filter((o) => o.status === OrderStatus.PENDING).slice(0, 5));
      },
    });
  }

  openOrder(order: Order): void {
    void this.router.navigate(['/admin/orders', order.id]);
  }
}
