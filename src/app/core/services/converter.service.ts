import { Injectable, signal, inject, ApplicationRef } from '@angular/core';
import { Observable, throwError, timer, of } from 'rxjs';
import { delay, map, tap, switchMap, catchError, finalize } from 'rxjs/operators';
import { ConversionRequest, ConversionResult, AudioQuality } from '../models/conversion.models';

@Injectable({
  providedIn: 'root'
})
export class ConverterService {
  private readonly processing = signal<boolean>(false);
  private currentJobId: string | null = null;
  private appRef = inject(ApplicationRef);

  processing$ = this.processing.asReadonly();

  convert(request: ConversionRequest): Observable<ConversionResult> {
    if (this.processing()) {
      return throwError(() => ({ message: 'Another conversion is in progress' }));
    }

    this.processing.set(true);
    this.currentJobId = crypto.randomUUID();

    return timer(1500).pipe(
      map(() => ({
        title: 'Sample Audio Track',
        thumbnail: 'https://picsum.photos/seed/youtube/320/180',
        duration: '3:45',
        downloadUrl: '#',
        size: '8.4 MB',
        status: 'completed' as const,
        progress: 100
      })),
      tap((result) => {
        console.log('Conversion completed', { jobId: this.currentJobId, result });
      }),
      catchError((error) => {
        this.currentJobId = null;
        return throwError(() => ({ message: 'Conversion failed. Please try again.' }));
      }),
      finalize(() => {
        this.processing.set(false);
        this.currentJobId = null;
        this.appRef.tick();
      })
    );
  }

  cancel(): void {
    this.processing.set(false);
    this.currentJobId = null;
  }
}