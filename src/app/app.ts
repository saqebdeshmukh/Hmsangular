import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/features/layout/header-component/header-component';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  hideLayout = false;
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  this.router.events.subscribe(() => {
    let route = this.activatedRoute.firstChild;
    while (route?.firstChild) route = route.firstChild;

    this.hideLayout = route?.snapshot.data['hideLayout'] ?? false;
  });
}
  protected readonly title = signal('healthcareui');
}
