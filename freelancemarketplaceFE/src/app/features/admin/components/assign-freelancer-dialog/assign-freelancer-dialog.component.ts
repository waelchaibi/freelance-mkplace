import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Role } from '../../../../core/models/role.enum';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { UserApiService } from '../../../../core/services/api/user-api.service';

export interface AssignFreelancerDialogData {
  orderId: number;
}

@Component({
  selector: 'app-assign-freelancer-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './assign-freelancer-dialog.component.html',
  styles: `.full-width { width: 100%; }`,
})
export class AssignFreelancerDialogComponent implements OnInit {
  private readonly userApi = inject(UserApiService);
  private readonly dialogRef = inject(MatDialogRef<AssignFreelancerDialogComponent>);
  readonly data = inject<AssignFreelancerDialogData>(MAT_DIALOG_DATA);

  readonly freelancers = signal<UserProfile[]>([]);
  readonly freelancerControl = new FormControl<number | null>(null, Validators.required);

  ngOnInit(): void {
    this.userApi.listUsers(Role.FREELANCER).subscribe({
      next: (users) => this.freelancers.set(users),
    });
  }

  confirm(): void {
    if (this.freelancerControl.invalid) {
      this.freelancerControl.markAsTouched();
      return;
    }
    this.dialogRef.close(this.freelancerControl.value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
