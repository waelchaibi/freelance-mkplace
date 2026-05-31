import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { frOrderStatus } from '../../../../core/i18n/fr-labels';
import { CreateAdminOrderRequest, Order, OrderStatus, UpdateOrderRequest } from '../../../../core/models/order.model';
import { Role } from '../../../../core/models/role.enum';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { UserApiService } from '../../../../core/services/api/user-api.service';

export interface AdminOrderFormDialogData {
  order?: Order | null;
}

@Component({
  selector: 'app-admin-order-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './admin-order-form-dialog.component.html',
})
export class AdminOrderFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminOrderFormDialogComponent>);
  readonly data = inject<AdminOrderFormDialogData>(MAT_DIALOG_DATA);
  private readonly orderApi = inject(OrderApiService);
  private readonly userApi = inject(UserApiService);

  readonly clients = signal<UserProfile[]>([]);
  readonly freelancers = signal<UserProfile[]>([]);
  readonly isEdit = !!this.data.order;
  readonly frOrderStatus = frOrderStatus;
  readonly statusOptions = Object.values(OrderStatus);

  readonly form = this.fb.nonNullable.group({
    clientId: [0, Validators.required],
    title: ['', Validators.maxLength(200)],
    technology: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.minLength(5)]],
    deadline: [''],
    assignedFreelancerId: [0],
    status: [OrderStatus.PENDING as OrderStatus],
  });

  ngOnInit(): void {
    this.userApi.listUsers(Role.CLIENT).subscribe((c) => this.clients.set(c));
    this.userApi.listUsers(Role.FREELANCER).subscribe((f) => this.freelancers.set(f));

    const order = this.data.order;
    if (order) {
      this.form.patchValue({
        clientId: order.clientId,
        title: order.title,
        technology: order.technology ?? '',
        description: order.description,
        deadline: order.deadline ?? '',
        assignedFreelancerId: order.assignedFreelancerId ?? 0,
        status: order.status,
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const freelancerId = raw.assignedFreelancerId > 0 ? raw.assignedFreelancerId : null;

    if (this.isEdit && this.data.order) {
      const request: UpdateOrderRequest = {
        title: raw.title || null,
        technology: raw.technology || null,
        description: raw.description,
        deadline: raw.deadline || null,
        assignedFreelancerId: freelancerId,
        status: raw.status,
      };
      this.orderApi.update(this.data.order.id, request).subscribe({
        next: (updated) => this.dialogRef.close(updated),
      });
      return;
    }

    const request: CreateAdminOrderRequest = {
      clientId: raw.clientId,
      title: raw.title || null,
      technology: raw.technology || null,
      description: raw.description,
      deadline: raw.deadline || null,
      assignedFreelancerId: freelancerId,
      status: raw.status,
    };
    this.orderApi.createByAdmin(request).subscribe({
      next: (created) => this.dialogRef.close(created),
    });
  }
}
