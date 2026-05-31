import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { frAvailability } from '../../../core/i18n/fr-labels';
import { FreelancerSummary } from '../../../core/models/order.model';

@Component({
  selector: 'app-freelancer-preview-card',
  standalone: true,
  imports: [DecimalPipe, MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './freelancer-preview-card.component.html',
  styleUrl: './freelancer-preview-card.component.scss',
})
export class FreelancerPreviewCardComponent {
  readonly freelancer = input.required<FreelancerSummary>();
  readonly showcaseLink = input<string | null>(null);
  readonly availabilityLabel = frAvailability;
}
