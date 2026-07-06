import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HistoryItem } from '../models/conversion.models';

const HISTORY_KEY = 'conversion_history';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  
  getHistory(): HistoryItem[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  addToHistory(item: Omit<HistoryItem, 'id' | 'date'>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const history = this.getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    history.unshift(newItem);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
  
  deleteFromHistory(id: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const history = this.getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  }
  
  clearHistory(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(HISTORY_KEY);
  }
}
