import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { Order } from '../../../../core/models/order.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, PageHeaderComponent, StatusChipComponent],
  templateUrl: './admin-messages.component.html',
  styleUrl: './admin-messages.component.scss',
})
export class AdminMessagesComponent implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly router = inject(Router);

  readonly orders = signal<Order[]>([]);
  readonly displayedColumns = ['id', 'client', 'freelancer', 'status', 'actions'];

  openChat(order: Order): void {
    void this.router.navigate(['/admin/orders', order.id]);
  }

  ngOnInit(): void {
    this.orderApi.getAdminOrders().subscribe({
      next: (orders) => this.orders.set(orders),
    });
  }
}
