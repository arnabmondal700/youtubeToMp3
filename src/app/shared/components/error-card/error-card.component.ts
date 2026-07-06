import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-card',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="error-card" role="alert">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h3 class="error-title">Something went wrong</h3>
      <p class="error-message">{{ message }}</p>
      @if (actionLabel) {
        <button mat-raised-button color="primary" (click)="onAction.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styleUrl: './error-card.component.scss'
})
export class ErrorCardComponent {
  @Input() message: string = 'An unexpected error occurred. Please try again.';
  @Input() actionLabel: string | null = null;
  @Output() onAction = new EventEmitter<void>();
}