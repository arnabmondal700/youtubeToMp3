import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly baseUrl = 'https://youtubetomp3.com';
  private readonly defaultTitle = 'YouTube to MP3 Converter - Free Online Tool';
  private readonly defaultDescription = 'Convert YouTube videos to MP3 audio files for free. Fast, secure, and high-quality conversion. No registration required.';

  updateTitle(pageTitle: string): void {
    this.title.setTitle(`${pageTitle} | ${this.defaultTitle}`);
  }

  updateMeta(description?: string, keywords?: string): void {
    const desc = description || this.defaultDescription;
    this.meta.updateTag({ name: 'description', content: desc });
    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    }
  }

  updateCanonical(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const url = this.router.url.split('?')[0];
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = `${this.baseUrl}${url}`;
    }
  }

  updateStructuredData(data: object): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }
}
