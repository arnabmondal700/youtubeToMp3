import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { HistoryItem } from '../models/conversion.models';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(private storage: StorageService) {}

  getAll(): HistoryItem[] {
    return this.storage.getHistory();
  }

  add(item: Omit<HistoryItem, 'id' | 'date'>): void {
    this.storage.addToHistory(item);
  }

  delete(id: string): void {
    this.storage.deleteFromHistory(id);
  }

  clear(): void {
    this.storage.clearHistory();
  }
}