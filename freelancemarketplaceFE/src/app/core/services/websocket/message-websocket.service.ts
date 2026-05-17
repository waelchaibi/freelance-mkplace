import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../../environments/environment';
import { Message } from '../../models/message.model';

function stompBrokerUrl(): string {
  return environment.apiUrl.replace(/^http/i, 'ws') + '/ws';
}

@Injectable({ providedIn: 'root' })
export class MessageWebSocketService {
  private client: Client | null = null;

  connect(): Promise<void> {
    if (this.client?.active) {
      return Promise.resolve();
    }

    this.client = new Client({
      brokerURL: stompBrokerUrl(),
      reconnectDelay: 5000,
    });

    return new Promise((resolve, reject) => {
      this.client!.onConnect = () => resolve();
      this.client!.onStompError = (frame) => reject(frame);
      this.client!.activate();
    });
  }

  subscribeToOrder(orderId: number, onMessage: (message: Message) => void): () => void {
    const subscription = this.client?.subscribe(`/topic/orders/${orderId}`, (frame: IMessage) => {
      onMessage(JSON.parse(frame.body) as Message);
    });

    return () => subscription?.unsubscribe();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
  }
}
