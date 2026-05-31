import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FR_ERR, FR_SNACK } from '../../../../core/i18n/fr-labels';
import { Message } from '../../../../core/models/message.model';
import { Order } from '../../../../core/models/order.model';
import { MessageApiService } from '../../../../core/services/api/message-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageWebSocketService } from '../../../../core/services/websocket/message-websocket.service';

interface RecipientOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-admin-order-messages',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-order-messages.component.html',
  styleUrl: './admin-order-messages.component.scss',
})
export class AdminOrderMessagesComponent implements OnDestroy {
  readonly order = input.required<Order>();

  private readonly messageApi = inject(MessageApiService);
  private readonly auth = inject(AuthService);
  private readonly ws = inject(MessageWebSocketService);
  private readonly snackBar = inject(MatSnackBar);

  readonly messages = signal<Message[]>([]);
  readonly loading = signal(false);
  readonly recipients = signal<RecipientOption[]>([]);
  private unsubscribeWs: (() => void) | null = null;
  private watchedOrderId: number | null = null;

  readonly receiverControl = new FormControl<number | null>(null, Validators.required);
  readonly messageControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(4000)],
  });

  constructor() {
    effect(() => {
      const currentOrder = this.order();
      if (currentOrder.id === this.watchedOrderId) {
        this.buildRecipients(currentOrder);
        return;
      }

      this.watchedOrderId = currentOrder.id;
      this.buildRecipients(currentOrder);
      this.loadMessages(currentOrder.id);
      this.resetWebSocket(currentOrder.id);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeWs?.();
  }

  send(): void {
    if (this.receiverControl.invalid || this.messageControl.invalid) {
      this.receiverControl.markAsTouched();
      this.messageControl.markAsTouched();
      return;
    }

    this.messageApi
      .send({
        orderId: this.order().id,
        receiverId: this.receiverControl.value!,
        content: this.messageControl.value.trim(),
      })
      .subscribe({
        next: (message) => {
          this.appendMessage(message);
          this.messageControl.reset();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.error ?? FR_ERR.sendMessage, FR_SNACK.close, { duration: 4000 });
        },
      });
  }

  isMine(message: Message): boolean {
    return message.senderId === this.auth.getUser()?.userId;
  }

  private buildRecipients(order: Order): void {
    const options: RecipientOption[] = [{ id: order.clientId, label: `Client: ${order.clientName}` }];
    if (order.assignedFreelancerId && order.assignedFreelancerName) {
      options.push({
        id: order.assignedFreelancerId,
        label: `Freelancer: ${order.assignedFreelancerName}`,
      });
    }
    this.recipients.set(options);
    if (options.length > 0 && !options.some((o) => o.id === this.receiverControl.value)) {
      this.receiverControl.setValue(options[0].id);
    }
  }

  private loadMessages(orderId: number): void {
    this.loading.set(true);
    this.messageApi.getByOrder(orderId).subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.loading.set(false);
      },
      error: (err) => {
        this.messages.set([]);
        this.loading.set(false);
        this.snackBar.open(err?.error?.error ?? FR_ERR.loadMessages, FR_SNACK.close, { duration: 4000 });
      },
    });
  }

  private resetWebSocket(orderId: number): void {
    this.unsubscribeWs?.();
    this.unsubscribeWs = null;
    void this.setupWebSocket(orderId);
  }

  private async setupWebSocket(orderId: number): Promise<void> {
    try {
      await this.ws.connect();
      this.unsubscribeWs = this.ws.subscribeAsAdmin(orderId, (message) => {
        this.appendMessage(message);
      });
    } catch {
      // REST fallback still works
    }
  }

  private appendMessage(message: Message): void {
    this.messages.update((list) => {
      if (list.some((m) => m.id === message.id)) return list;
      return [...list, message];
    });
  }
}
