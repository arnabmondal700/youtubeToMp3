import { Injectable, signal, inject, ApplicationRef } from '@angular/core';
import { Observable, throwError, of, concat, EMPTY } from 'rxjs';
import { delay, map, tap, switchMap, catchError, finalize, scan } from 'rxjs/operators';
import { ConversionRequest, ConversionResult, ConversionProgress, ConversionState } from '../models/conversion.models';

@Injectable({
  providedIn: 'root'
})
export class ConverterService {
  private readonly conversionState = signal<ConversionState>(ConversionState.IDLE);
  private readonly conversionProgress = signal<ConversionProgress>({ stage: '', progress: 0 });
  private currentJobId: string | null = null;
  private appRef = inject(ApplicationRef);

  conversionState$ = this.conversionState.asReadonly();
  conversionProgress$ = this.conversionProgress.asReadonly();

  private readonly mockStages = [
    { stage: 'Checking URL...', progress: 25, duration: 300 },
    { stage: 'Fetching metadata...', progress: 50, duration: 400 },
    { stage: 'Converting to MP3...', progress: 75, duration: 500 },
    { stage: 'Preparing download...', progress: 100, duration: 300 }
  ];

  // Realistic mock video titles for demo
  private readonly mockTitles = [
    'Amazing Song - Official Music Video',
    'Top Hits 2024 - Best Music Playlist',
    'Relaxing Piano Music for Study & Work',
    'Popular Song Cover by Talent Artist',
    'Original Audio - Viral Video',
    'Music Mix - Best Songs of All Time',
    'Acoustic Session - Live Performance',
    'Electronic Dance Music - DJ Mix'
  ];

  convert(request: ConversionRequest): Observable<ConversionResult> {
    if (this.conversionState() !== ConversionState.IDLE) {
      return throwError(() => ({ message: 'Another conversion is in progress' }));
    }

    // Validate URL first
    return of({ url: request.url, quality: request.quality }).pipe(
      switchMap(() => this.validateUrl(request.url)),
      tap(() => this.conversionState.set(ConversionState.VALIDATING)),
      switchMap(() => this.simulateConversion(request)),
      tap((result) => {
        console.log('Conversion completed', { jobId: this.currentJobId, result });
      }),
      catchError((error) => {
        this.conversionState.set(ConversionState.ERROR);
        return throwError(() => ({ 
          message: error.message || 'Conversion failed. Please try again.' 
        }));
      }),
      finalize(() => {
        this.currentJobId = null;
        this.appRef.tick();
      })
    );
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
      /youtube\.com\/watch\?.*v=([\w-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  private generateMockMetadata(videoId: string): { title: string; duration: string; size: string } {
    // Use video ID hash to consistently generate same metadata for same video
    let hash = 0;
    for (let i = 0; i < videoId.length; i++) {
      hash = ((hash << 5) - hash) + videoId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const titleIndex = Math.abs(hash) % this.mockTitles.length;
    const title = `${this.mockTitles[titleIndex]} [${videoId.slice(0, 6)}]`;
    
    // Generate consistent duration between 2:30 and 5:45 (165-345 seconds)
    const durationSeconds = 165 + (Math.abs(hash) % 180);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Generate size based on duration (roughly 4-8 MB for 2-6 min audio)
    const sizeMB = (3.5 + ((Math.abs(hash) % 50) / 10)).toFixed(1);
    const size = `${sizeMB} MB`;
    
    return { title, duration, size };
  }

  private validateUrl(url: string): Observable<void> {
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/;
    
    if (!urlPattern.test(url)) {
      return throwError(() => ({ message: 'Invalid YouTube URL. Please check and try again.' }));
    }

    // Simulate validation delay
    return of(void 0).pipe(
      delay(200),
      tap(() => this.conversionState.set(ConversionState.PROCESSING))
    );
  }

  private simulateConversion(request: ConversionRequest): Observable<ConversionResult> {
    this.currentJobId = crypto.randomUUID();

    // Randomly simulate error for demo purposes (10% chance)
    const shouldError = Math.random() < 0.1;

    // Extract video ID and generate realistic metadata
    const videoId = this.extractVideoId(request.url);
    const mockMetadata = videoId ? this.generateMockMetadata(videoId) : { 
      title: 'Downloaded Audio', 
      duration: '3:45', 
      size: '6.2 MB' 
    };

    return concat(
      ...this.mockStages.map((stage, index) => 
        of(stage).pipe(
          delay(stage.duration),
          tap((s) => {
            this.conversionProgress.set({ stage: s.stage, progress: s.progress });
          })
        )
      )
    ).pipe(
      map(() => ({
        title: mockMetadata.title,
        thumbnail: videoId 
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : `https://picsum.photos/seed/${this.currentJobId}/320/180`,
        duration: mockMetadata.duration,
        downloadUrl: '#',
        size: mockMetadata.size,
        status: 'completed' as const,
        progress: 100
      })),
      map((result) => {
        if (shouldError) {
          throw new Error('Conversion failed due to network timeout. Please try again.');
        }
        this.conversionState.set(ConversionState.SUCCESS);
        return result;
      })
    );
  }

  retry(): void {
    this.conversionState.set(ConversionState.IDLE);
    this.conversionProgress.set({ stage: '', progress: 0 });
    this.currentJobId = null;
  }

  reset(): void {
    this.conversionState.set(ConversionState.IDLE);
    this.conversionProgress.set({ stage: '', progress: 0 });
    this.currentJobId = null;
  }
}
