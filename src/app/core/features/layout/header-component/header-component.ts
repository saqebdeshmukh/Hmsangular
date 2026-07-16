import { Component, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.services';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {

  constructor(private auth: AuthService, private router: Router) {}

  // ✅ Reactive role using signal
  role = computed(() => this.auth.user()?.role);

  // ngOnInit() {
  //   if(!this.role()) {
  //     this.router.navigate(['/login']);
  //   }
  // }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}