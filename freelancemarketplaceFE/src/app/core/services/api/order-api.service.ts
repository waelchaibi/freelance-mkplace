import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateOrderRequest, Order, OrderStatus } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/orders`;

  constructor(private readonly http: HttpClient) {}

  getClientOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/client`);
  }

  getFreelancerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/freelancer`);
  }

  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/admin`);
  }

  getById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  assignFreelancer(orderId: number, freelancerId: number): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/assign`, { freelancerId });
  }

  create(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }

  updateStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/status`, { status });
  }
}
