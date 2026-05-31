import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';

export interface OrderProgressDialogData {
  currentProgress: number;
}

@Component({
  selector: 'app-order-progress-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSliderModule,
    MatButtonModule,
  ],
  templateUrl: './order-progress-dialog.component.html',
})
export class OrderProgressDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<OrderProgressDialogComponent>);
  readonly data = inject<OrderProgressDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    progressPercent: [
      this.data.currentProgress,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
  });

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.controls.progressPercent.value);
  }
}
