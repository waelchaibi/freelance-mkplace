import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { OrderStatus } from '../../../../core/models/order.model';
import { ServiceStatus } from '../../../../core/models/service.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { ServiceApiService } from '../../../../core/services/api/service-api.service';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink, PageHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly userApi = inject(UserApiService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly orderApi = inject(OrderApiService);

  readonly usersCount = signal(0);
  readonly pendingServices = signal(0);
  readonly pendingOrders = signal(0);
  readonly totalOrders = signal(0);

  ngOnInit(): void {
    this.userApi.listUsers().subscribe({
      next: (users) => this.usersCount.set(users.length),
    });

    this.serviceApi.getAll().subscribe({
      next: (services) =>
        this.pendingServices.set(services.filter((s) => s.status === ServiceStatus.PENDING).length),
    });

    this.orderApi.getAdminOrders().subscribe({
      next: (orders) => {
        this.totalOrders.set(orders.length);
        this.pendingOrders.set(orders.filter((o) => o.status === OrderStatus.PENDING).length);
      },
    });
  }
}
