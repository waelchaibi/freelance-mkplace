import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { ServiceStatus } from '../../../../core/models/service.model';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { ServiceApiService } from '../../../../core/services/api/service-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-freelancer-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink, PageHeaderComponent],
  templateUrl: './freelancer-dashboard.component.html',
  styleUrl: './freelancer-dashboard.component.scss',
})
export class FreelancerDashboardComponent implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly auth = inject(AuthService);

  protected readonly OrderStatus = OrderStatus;
  readonly orders = signal<Order[]>([]);
  readonly pendingServices = signal(0);
  readonly approvedServices = signal(0);

  ngOnInit(): void {
    this.orderApi.getFreelancerOrders().subscribe({
      next: (orders) => this.orders.set(orders),
    });

    const userId = this.auth.getUser()?.userId;
    if (!userId) return;

    this.serviceApi.getAll().subscribe({
      next: (services) => {
        const mine = services.filter((s) => s.freelancerId === userId);
        this.pendingServices.set(mine.filter((s) => s.status === ServiceStatus.PENDING).length);
        this.approvedServices.set(mine.filter((s) => s.status === ServiceStatus.APPROVED).length);
      },
    });
  }

  countOrders(status: OrderStatus): number {
    return this.orders().filter((o) => o.status === status).length;
  }
}
