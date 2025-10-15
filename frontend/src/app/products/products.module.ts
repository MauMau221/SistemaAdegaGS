import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { ProductSearchComponent } from './components/product-search/product-search.component';
import { ProductCardComponent } from '../shared/components/product-card/product-card.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListPageComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ProductListPageComponent,
    ProductFilterComponent,
    ProductSearchComponent,
    ProductCardComponent
  ]
})
export class ProductsModule { }
