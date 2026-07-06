import { Component } from '@angular/core';
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
import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionModule } from '@angular/material/expansion';
import { ErrorCardComponent } from '../../shared/components/error-card/error-card.component';

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
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private converterService: ConverterService,
    private historyService: HistoryService,
    private downloadService: DownloadService
  ) {
    this.convertForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/)]],
      quality: [192, Validators.required]
    });
  }

  convertForm: any;
  processing = false;
  result: { title: string; thumbnail: string; duration: string; size: string; downloadUrl: string; } | null = null;
  error: string | null = null;

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

  getProcessing(): boolean {
    return this.converterService.processing$();
  }

  scrollToConverter(): void {
    const element = document.getElementById('converter');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSubmit(): void {
    if (this.convertForm.invalid || this.processing) return;

    this.processing = true;
    this.error = null;
    this.result = null;

    const { url, quality } = this.convertForm.value;

    if (!url || !quality) return;

    this.converterService.convert({ url, quality }).subscribe({
      next: (result) => {
        this.processing = false;
        this.result = result;
        this.historyService.add({
          title: result.title,
          thumbnail: result.thumbnail,
          quality: quality as number,
          downloadUrl: result.downloadUrl
        });
      },
      error: (err) => {
        this.processing = false;
        this.error = err?.message || 'Conversion failed. Please try again.';
      }
    });
  }

  reset(): void {
    this.convertForm.reset({ quality: 192 });
    this.result = null;
    this.error = null;
  }

  download(): void {
    if (this.result) {
      const durationMatch = this.result.duration.match(/(\d+):(\d+)/);
      const totalSeconds = durationMatch
        ? parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2])
        : 225;
      this.downloadService.downloadAsMp3(this.result.title, totalSeconds);
    }
  }
}