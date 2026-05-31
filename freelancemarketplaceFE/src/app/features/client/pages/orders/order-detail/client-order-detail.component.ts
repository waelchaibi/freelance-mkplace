import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../../../core/models/order.model';
import { bindOrderFromRoute } from '../../../../../core/utils/order-route-loader';
import { FreelancerPreviewCardComponent } from '../../../../../shared/components/freelancer-preview-card/freelancer-preview-card.component';
import { OrderFeedbackComponent } from '../../../../../shared/components/order-feedback/order-feedback.component';
import { OrderMessagesComponent } from '../../../../../shared/components/order-messages/order-messages.component';
import { OrderTimelineComponent } from '../../../../../shared/components/order-timeline/order-timeline.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-client-order-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusChipComponent,
    OrderMessagesComponent,
    OrderFeedbackComponent,
    OrderTimelineComponent,
    FreelancerPreviewCardComponent,
  ],
  templateUrl: './client-order-detail.component.html',
  styleUrl: './client-order-detail.component.scss',
})
export class ClientOrderDetailComponent {
  protected readonly OrderStatus = OrderStatus;
  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);

  constructor() {
    bindOrderFromRoute({ order: this.order, loading: this.loading });
  }
}
