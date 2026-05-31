import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    NotificationBellComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Clients', route: '/admin/clients', icon: 'person' },
    { label: 'Freelancers', route: '/admin/freelancers', icon: 'engineering' },
    { label: 'Services', route: '/admin/services', icon: 'verified' },
    { label: 'Projets', route: '/admin/orders', icon: 'assignment' },
    { label: 'Messages', route: '/admin/messages', icon: 'forum' },
    { label: 'Feedbacks', route: '/admin/feedbacks', icon: 'rate_review' },
    { label: 'Notifications', route: '/admin/notifications', icon: 'notifications' },
    { label: 'Journal envoyés', route: '/admin/notification-log', icon: 'send' },
  ];
}
