import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FR_ERR, FR_SNACK } from '../../../core/i18n/fr-labels';
import { ConversationSummary } from '../../../core/models/conversation.model';
import { MessageApiService } from '../../../core/services/api/message-api.service';
import { OrderMessagesComponent } from '../order-messages/order-messages.component';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { StatusChipComponent } from '../status-chip/status-chip.component';

@Component({
  selector: 'app-message-inbox',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatusChipComponent,
    OrderMessagesComponent,
  ],
  templateUrl: './message-inbox.component.html',
  styleUrl: './message-inbox.component.scss',
})
export class MessageInboxComponent implements OnInit {
  private readonly messageApi = inject(MessageApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly title = this.route.snapshot.data['title'] as string;
  readonly subtitle = this.route.snapshot.data['subtitle'] as string;

  readonly loading = signal(true);
  readonly conversations = signal<ConversationSummary[]>([]);
  readonly selectedOrderId = signal<number | null>(null);

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.queryParamMap.get('orderId'));
    if (orderId) {
      this.selectedOrderId.set(orderId);
    }

    this.loadInbox();
  }

  selectConversation(conversation: ConversationSummary): void {
    this.selectedOrderId.set(conversation.orderId);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId: conversation.orderId },
      queryParamsHandling: 'merge',
    });
  }

  private loadInbox(): void {
    this.loading.set(true);
    this.messageApi.getInbox().subscribe({
      next: (items) => {
        this.conversations.set(items);
        this.loading.set(false);
        if (!this.selectedOrderId() && items.length > 0) {
          this.selectConversation(items[0]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err?.error?.error ?? FR_ERR.loadInbox, FR_SNACK.close, { duration: 4000 });
      },
    });
  }
}
