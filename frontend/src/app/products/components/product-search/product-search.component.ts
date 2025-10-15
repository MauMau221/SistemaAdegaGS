import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProductSearchComponent implements OnInit {
  @Input() initialTerm: string = '';
  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.searchControl.setValue(this.initialTerm);

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.search.emit(term || '');
      });
  }
}
