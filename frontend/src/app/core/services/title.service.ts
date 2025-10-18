import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleSubject = new BehaviorSubject<string>('Adega GS');
  
  constructor(@Inject(DOCUMENT) private document: Document) {}

  setTitle(title: string): void {
    this.document.title = title;
    this.titleSubject.next(title);
  }

  getTitle(): string {
    return this.document.title;
  }

  watchTitle(): BehaviorSubject<string> {
    return this.titleSubject;
  }
}
