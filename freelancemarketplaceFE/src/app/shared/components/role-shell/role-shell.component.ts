import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-shell',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatCardModule],
  templateUrl: './role-shell.component.html',
  styleUrl: './role-shell.component.scss',
})
export class RoleShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('Dashboard modules will be implemented in the next phase.');

  protected readonly auth = inject(AuthService);
}
