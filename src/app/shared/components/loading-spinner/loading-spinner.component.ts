import { Component, Input } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgxSpinnerModule],
  template: `
    <ngx-spinner
      [bdColor]="color"
      [size]="size"
      [color]="'#ffffff'"
      [type]="type"
      [fullScreen]="fullScreen">
      {{ message }}
    </ngx-spinner>
  `
})
export class LoadingSpinnerComponent {
  @Input() type: 'line-scale-party' | 'line-scale' | 'square-jelly-box' | 'ball-scale' = 'line-scale-party';
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() color: string = '#f44336';
  @Input() fullScreen: boolean = true;
  @Input() message: string = 'Loading...';
}