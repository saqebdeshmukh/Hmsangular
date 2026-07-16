import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.services';

@Component({
  selector: 'app-homepage-component',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './homepage-component.html',
  styleUrl: './homepage-component.css',
})
export class HomepageComponent {
  private auth = inject(AuthService);
  role = computed(() => this.auth.user()?.role);
}
