import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-card',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="error-card" role="alert">
      <mat-icon class="error-icon">warning</mat-icon>
      <div class="error-content">
        <h3 class="error-title">Oops! Something went wrong</h3>
        <p class="error-message">{{ message }}</p>
        @if (actionLabel) {
          <button mat-raised-button color="primary" (click)="onAction.emit()">
            <mat-icon>refresh</mat-icon>
            {{ actionLabel }}
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './error-card.component.scss'
})
export class ErrorCardComponent {
  @Input() message: string = 'An unexpected error occurred. Please try again.';
  @Input() actionLabel: string | null = 'Try Again';
  @Output() onAction = new EventEmitter<void>();
}
