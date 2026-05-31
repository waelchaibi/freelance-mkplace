import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResponse } from '../../models/paged.model';
import {
  AssignFreelancerRequest,
  CreateAdminOrderRequest,
  CreateOrderRequest,
  Order,
  OrderStatus,
  UpdateOrderProgressRequest,
  UpdateOrderRequest,
} from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/orders`;

  constructor(private readonly http: HttpClient) {}

  getClientOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/client`);
  }

  getClientOrdersPaged(page: number, size = 10): Observable<PagedResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Order>>(`${this.baseUrl}/client`, { params });
  }

  getFreelancerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/freelancer`);
  }

  getFreelancerOrdersPaged(page: number, size = 10): Observable<PagedResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Order>>(`${this.baseUrl}/freelancer`, { params });
  }

  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/admin`);
  }

  getAdminOrdersPaged(page: number, size = 10): Observable<PagedResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Order>>(`${this.baseUrl}/admin`, { params });
  }

  getById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  assignFreelancer(orderId: number, request: AssignFreelancerRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/assign`, request);
  }

  create(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }

  createByAdmin(request: CreateAdminOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/admin`, request);
  }

  update(orderId: number, request: UpdateOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}`, request);
  }

  delete(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${orderId}`);
  }

  updateStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/status`, { status });
  }

  updateProgress(orderId: number, request: UpdateOrderProgressRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/progress`, request);
  }
}
