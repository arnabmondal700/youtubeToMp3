import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  private seoService = inject(SeoService);

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
      question: 'What audio qualities are available?',
      answer: 'We offer multiple quality options from 64 kbps to 320 kbps. Higher bitrates provide better audio quality but larger file sizes.'
    },
    {
      question: 'Is it safe to use?',
      answer: 'Yes, we don\'t store any personal information or downloaded files. All conversions are processed securely.'
    },
    {
      question: 'What devices are supported?',
      answer: 'Our converter works on all devices including Windows, Mac, iOS, Android, and Linux. It\'s fully responsive and mobile-friendly.'
    },
    {
      question: 'How long does conversion take?',
      answer: 'Conversion time depends on the video length and quality selected. Most conversions complete within a few seconds.'
    }
  ];

  constructor() {
    this.seoService.updateTitle('Frequently Asked Questions');
    this.seoService.updateMeta('Find answers to common questions about our YouTube to MP3 converter.');
  }
}