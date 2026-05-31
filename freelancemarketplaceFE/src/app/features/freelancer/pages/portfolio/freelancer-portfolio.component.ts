import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of, switchMap } from 'rxjs';
import { FR_SNACK, resolveApiFileUrl } from '../../../../core/i18n/fr-labels';
import { CreatePortfolioItemRequest, PortfolioItem } from '../../../../core/models/portfolio.model';
import { PortfolioApiService } from '../../../../core/services/api/portfolio-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-freelancer-portfolio',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  templateUrl: './freelancer-portfolio.component.html',
  styleUrl: './freelancer-portfolio.component.scss',
})
export class FreelancerPortfolioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly apiUrl = environment.apiUrl;
  readonly items = signal<PortfolioItem[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly pendingImageFile = signal<File | null>(null);
  readonly pendingAttachmentFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  saving = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    projectUrl: [''],
    imageUrl: [''],
    attachmentUrl: [''],
    technologies: [''],
  });

  ngOnInit(): void {
    this.loadItems();
  }

  mediaUrl(path: string | null | undefined): string | null {
    return resolveApiFileUrl(path, this.apiUrl);
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.clearPendingFiles();
  }

  startEdit(item: PortfolioItem): void {
    this.editingId.set(item.id);
    this.clearPendingFiles();
    this.form.patchValue({
      title: item.title,
      description: item.description,
      projectUrl: item.projectUrl ?? '',
      imageUrl: item.imageUrl ?? '',
      attachmentUrl: item.attachmentUrl ?? '',
      technologies: item.technologies ?? '',
    });
    this.imagePreviewUrl.set(this.mediaUrl(item.imageUrl));
  }

  handleImageFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pendingImageFile.set(file);
    this.imagePreviewUrl.set(URL.createObjectURL(file));
  }

  handleAttachmentFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pendingAttachmentFile.set(file);
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const imageUpload$ = this.pendingImageFile()
      ? this.portfolioApi.uploadImage(this.pendingImageFile()!)
      : of(null);
    const attachmentUpload$ = this.pendingAttachmentFile()
      ? this.portfolioApi.uploadAttachment(this.pendingAttachmentFile()!)
      : of(null);

    forkJoin({ image: imageUpload$, attachment: attachmentUpload$ })
      .pipe(
        switchMap(({ image, attachment }) => {
          const payload: CreatePortfolioItemRequest = {
            title: this.form.controls.title.value,
            description: this.form.controls.description.value,
            projectUrl: this.form.controls.projectUrl.value || null,
            imageUrl: image?.url ?? (this.form.controls.imageUrl.value || null),
            attachmentUrl: attachment?.url ?? (this.form.controls.attachmentUrl.value || null),
            technologies: this.form.controls.technologies.value || null,
          };
          const editingId = this.editingId();
          return editingId
            ? this.portfolioApi.update(editingId, payload)
            : this.portfolioApi.create(payload);
        })
      )
      .subscribe({
        next: () => {
          this.saving = false;
          this.editingId.set(null);
          this.form.reset();
          this.clearPendingFiles();
          this.loadItems();
          this.snackBar.open('Portfolio enregistré', FR_SNACK.close, { duration: 2500 });
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err?.error?.error ?? FR_SNACK.error, FR_SNACK.close, { duration: 4000 });
        },
      });
  }

  remove(item: PortfolioItem): void {
    this.portfolioApi.delete(item.id).subscribe({
      next: () => {
        this.loadItems();
        this.snackBar.open('Élément supprimé', FR_SNACK.close, { duration: 2500 });
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error ?? FR_SNACK.error, FR_SNACK.close, { duration: 4000 });
      },
    });
  }

  private clearPendingFiles(): void {
    this.pendingImageFile.set(null);
    this.pendingAttachmentFile.set(null);
    this.imagePreviewUrl.set(null);
  }

  private loadItems(): void {
    this.portfolioApi.getMyPortfolio().subscribe({
      next: (items) => this.items.set(items),
    });
  }
}
