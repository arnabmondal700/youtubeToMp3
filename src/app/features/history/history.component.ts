import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  private historyService = inject(HistoryService);
  private seoService = inject(SeoService);

  history = this.historyService.getAll();
  displayedColumns: string[] = ['thumbnail', 'title', 'quality', 'date', 'actions'];

  constructor() {
    this.seoService.updateTitle('Conversion History');
    this.seoService.updateMeta('View your YouTube to MP3 conversion history.');
  }

  deleteItem(id: string): void {
    this.historyService.delete(id);
    this.history = this.historyService.getAll();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all history?')) {
      this.historyService.clear();
      this.history = this.historyService.getAll();
    }
  }

  download(url: string, title: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.mp3`;
    link.click();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getQualityLabel(quality: number): string {
    return `${quality} kbps`;
  }
}