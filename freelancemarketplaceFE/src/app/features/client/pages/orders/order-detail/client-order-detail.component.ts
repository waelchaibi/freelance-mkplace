import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Order } from '../../../../../core/models/order.model';
import { bindOrderFromRoute } from '../../../../../core/utils/order-route-loader';
import { OrderMessagesComponent } from '../../../../../shared/components/order-messages/order-messages.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-client-order-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatusChipComponent,
    OrderMessagesComponent,
  ],
  templateUrl: './client-order-detail.component.html',
  styleUrl: './client-order-detail.component.scss',
})
export class ClientOrderDetailComponent {
  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);

  constructor() {
    bindOrderFromRoute({ order: this.order, loading: this.loading });
  }
}
