import { DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { Order, OrderStatus } from '../models/order.model';
import { OrderApiService } from '../services/api/order-api.service';

export function bindOrderFromRoute(options: {
  order: WritableSignal<Order | null>;
  loading?: WritableSignal<boolean>;
  onLoaded?: (order: Order) => void;
}): void {
  const route = inject(ActivatedRoute);
  const orderApi = inject(OrderApiService);
  const destroyRef = inject(DestroyRef);

  const loading = options.loading ?? signal(false);

  route.paramMap
    .pipe(
      switchMap((params) => {
        const orderId = Number(params.get('id'));
        if (Number.isNaN(orderId)) {
          options.order.set(null);
          loading.set(false);
          return EMPTY;
        }
        loading.set(true);
        options.order.set(null);
        return orderApi.getById(orderId);
      }),
      takeUntilDestroyed(destroyRef)
    )
    .subscribe({
      next: (order) => {
        options.order.set(order);
        options.onLoaded?.(order);
        loading.set(false);
      },
      error: () => {
        options.order.set(null);
        loading.set(false);
      },
    });
}

export function applyOrderStatus(order: Order, statusControl: { setValue: (v: OrderStatus) => void }): void {
  statusControl.setValue(order.status);
}
