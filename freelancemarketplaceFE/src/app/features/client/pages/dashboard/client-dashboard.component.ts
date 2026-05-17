import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink, PageHeaderComponent],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit {
  private readonly orderApi = inject(OrderApiService);

  protected readonly OrderStatus = OrderStatus;
  readonly orders = signal<Order[]>([]);

  ngOnInit(): void {
    this.orderApi.getClientOrders().subscribe({
      next: (orders) => this.orders.set(orders),
    });
  }

  countByStatus(status: OrderStatus): number {
    return this.orders().filter((o) => o.status === status).length;
  }
}
