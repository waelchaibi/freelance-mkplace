import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Order } from '../../../../core/models/order.model';
import { Role } from '../../../../core/models/role.enum';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { UserApiService } from '../../../../core/services/api/user-api.service';

export interface AssignOrderWizardDialogData {
  orders: Order[];
}

@Component({
  selector: 'app-assign-order-wizard-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './assign-order-wizard-dialog.component.html',
})
export class AssignOrderWizardDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AssignOrderWizardDialogComponent>);
  readonly data = inject<AssignOrderWizardDialogData>(MAT_DIALOG_DATA);
  private readonly orderApi = inject(OrderApiService);
  private readonly userApi = inject(UserApiService);

  readonly clients = signal<UserProfile[]>([]);
  readonly freelancers = signal<UserProfile[]>([]);
  readonly filteredOrders = signal<Order[]>([]);
  readonly step = signal(0);
  saving = false;

  readonly form = this.fb.nonNullable.group({
    clientId: [0, Validators.required],
    orderId: [0, Validators.required],
    freelancerId: [0, Validators.required],
    deadline: [''],
  });

  ngOnInit(): void {
    this.userApi.listUsers(Role.CLIENT).subscribe((c) => this.clients.set(c));
    this.userApi.listUsers(Role.FREELANCER).subscribe((f) => this.freelancers.set(f));
    this.filteredOrders.set(this.data.orders);

    this.form.controls.clientId.valueChanges.subscribe((clientId) => {
      this.filteredOrders.set(this.data.orders.filter((o) => o.clientId === clientId));
      this.form.controls.orderId.setValue(0);
    });
  }

  nextStep(): void {
    this.step.update((s) => s + 1);
  }

  prevStep(): void {
    this.step.update((s) => Math.max(0, s - 1));
  }

  confirm(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const { orderId, freelancerId, deadline } = this.form.getRawValue();
    this.saving = true;
    this.orderApi
      .assignFreelancer(orderId, {
        freelancerId,
        deadline: deadline || null,
      })
      .subscribe({
        next: (order) => {
          this.saving = false;
          this.dialogRef.close(order);
        },
        error: () => {
          this.saving = false;
        },
      });
  }
}
