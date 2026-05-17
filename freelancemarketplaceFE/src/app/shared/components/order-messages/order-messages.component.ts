import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Message } from '../../../core/models/message.model';
import { UserProfile } from '../../../core/models/user-profile.model';
import { MessageApiService } from '../../../core/services/api/message-api.service';
import { UserApiService } from '../../../core/services/api/user-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageWebSocketService } from '../../../core/services/websocket/message-websocket.service';

@Component({
  selector: 'app-order-messages',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-messages.component.html',
  styleUrl: './order-messages.component.scss',
})
export class OrderMessagesComponent implements OnDestroy {
  readonly orderId = input.required<number>();

  private readonly messageApi = inject(MessageApiService);
  private readonly userApi = inject(UserApiService);
  private readonly auth = inject(AuthService);
  private readonly ws = inject(MessageWebSocketService);
  private readonly snackBar = inject(MatSnackBar);

  readonly messages = signal<Message[]>([]);
  readonly loading = signal(false);
  private admin: UserProfile | null = null;
  private unsubscribeWs: (() => void) | null = null;
  private watchedOrderId: number | null = null;

  readonly messageControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(4000)],
  });

  constructor() {
    this.userApi.getAdmin().subscribe({
      next: (admin) => {
        this.admin = admin;
      },
      error: () => {
        this.snackBar.open('Could not load admin contact', 'Close', { duration: 4000 });
      },
    });

    effect(() => {
      const orderId = this.orderId();
      if (!orderId) {
        return;
      }
      if (orderId === this.watchedOrderId) {
        return;
      }
      this.watchedOrderId = orderId;
      this.loadMessages(orderId);
      this.resetWebSocket(orderId);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeWs?.();
  }

  onEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.shiftKey) {
      return;
    }
    event.preventDefault();
    this.send();
  }

  send(): void {
    if (!this.admin || this.messageControl.invalid) {
      this.messageControl.markAsTouched();
      if (!this.admin) {
        this.snackBar.open('Admin contact not ready yet', 'Close', { duration: 3000 });
      }
      return;
    }

    this.messageApi
      .send({
        orderId: this.orderId(),
        receiverId: this.admin.id,
        content: this.messageControl.value.trim(),
      })
      .subscribe({
        next: (message) => {
          this.appendMessage(message);
          this.messageControl.reset();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.error ?? 'Failed to send message', 'Close', { duration: 4000 });
        },
      });
  }

  isMine(message: Message): boolean {
    return message.senderId === this.auth.getUser()?.userId;
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
        this.snackBar.open(err?.error?.error ?? 'Could not load messages', 'Close', { duration: 4000 });
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
      this.unsubscribeWs = this.ws.subscribeToOrder(orderId, (message) => {
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
