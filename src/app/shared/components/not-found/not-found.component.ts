import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="not-found">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <a mat-raised-button color="primary" routerLink="/">Go Back Home</a>
      </div>
    </div>
  `,
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {}