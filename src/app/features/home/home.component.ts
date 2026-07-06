import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConverterService } from '../../core/services/converter.service';
import { HistoryService } from '../../core/services/history.service';
import { DownloadService } from '../../core/services/download.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionModule } from '@angular/material/expansion';
import { ErrorCardComponent } from '../../shared/components/error-card/error-card.component';
import { AsyncPipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ConversionState, ConversionResult, ConversionProgress } from '../../core/models/conversion.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatAccordion,
    MatExpansionModule,
    ErrorCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  ConversionState = ConversionState;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private converterService: ConverterService,
    private historyService: HistoryService,
    private downloadService: DownloadService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.convertForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/)]],
      quality: [192, Validators.required]
    });

    // Subscribe to state changes in constructor (injection context)
    toObservable(this.converterService.conversionState$).pipe(
      takeUntil(this.destroy$),
      tap((state) => {
        this.conversionState = state;
        // Disable form controls during processing
        const shouldDisable = state === ConversionState.VALIDATING || 
                              state === ConversionState.PROCESSING;
        
        if (shouldDisable) {
          this.convertForm.get('url')?.disable();
          this.convertForm.get('quality')?.disable();
        } else {
          this.convertForm.get('url')?.enable();
          this.convertForm.get('quality')?.enable();
        }
        
        // Trigger change detection to avoid ExpressionChanged error
        this.cdr.markForCheck();
      })
    ).subscribe();

    toObservable(this.converterService.conversionProgress$).pipe(
      takeUntil(this.destroy$)
    ).subscribe((progress: ConversionProgress) => {
      this.progress = { stage: progress.stage, percentage: progress.progress };
      this.cdr.markForCheck();
    });
  }

  convertForm: any;
  result: ConversionResult | null = null;
  errorMessage: string | null = null;
  conversionState: ConversionState = ConversionState.IDLE;
  progress = { stage: '', percentage: 0 };
  isFormDisabled = false;

  faqs = [
    {
      question: 'Is it free?',
      answer: 'Yes, our YouTube to MP3 converter is completely free to use. There are no hidden charges or subscription fees.'
    },
    {
      question: 'Is registration required?',
      answer: 'No, you don\'t need to register or create an account. Just paste the YouTube URL and convert.'
    },
    {
      question: 'Is it safe to use?',
      answer: 'Yes, we don\'t store any personal information or downloaded files. All conversions are processed securely.'
    },
    {
      question: 'What devices are supported?',
      answer: 'Our converter works on all devices including Windows, Mac, iOS, Android, and Linux. It\'s fully responsive and mobile-friendly.'
    }
  ];


  scrollToConverter(): void {
    const element = document.getElementById('converter');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSubmit(): void {
    if (this.convertForm.invalid || this.isProcessing()) return;

    const { url, quality } = this.convertForm.value;

    if (!url || !quality) return;

    this.errorMessage = null;
    this.result = null;

    this.converterService.convert({ url, quality }).subscribe({
      next: (result) => {
        this.result = result;
        if (quality && result) {
          this.historyService.add({
            title: result.title,
            thumbnail: result.thumbnail,
            quality: quality as number,
            downloadUrl: result.downloadUrl
          });
        }
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Conversion failed. Please try again.';
      }
    });
  }

  isProcessing(): boolean {
    return this.conversionState === ConversionState.VALIDATING ||
           this.conversionState === ConversionState.PROCESSING;
  }

  isIdle(): boolean {
    return this.conversionState === ConversionState.IDLE;
  }

  hasError(): boolean {
    return this.conversionState === ConversionState.ERROR;
  }

  hasResult(): boolean {
    return this.conversionState === ConversionState.SUCCESS;
  }

  reset(): void {
    this.convertForm.reset({ quality: 192 });
    this.result = null;
    this.errorMessage = null;
    this.progress = { stage: '', percentage: 0 };
    this.converterService.reset();
  }

  retry(): void {
    this.errorMessage = null;
    this.converterService.retry();
  }

  download(): void {
    if (this.result) {
      const durationMatch = this.result.duration.match(/(\d+):(\d+)/);
      const totalSeconds = durationMatch
        ? parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2])
        : 225;

      this.snackBar.open('Preparing download...', 'Close', { duration: 2000 });

      this.downloadService.downloadAsMp3(this.result.title, totalSeconds).subscribe({
        complete: () => {
          setTimeout(() => {
            this.snackBar.open('Download started successfully!', 'Close', { duration: 3000 });
          }, 100);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
