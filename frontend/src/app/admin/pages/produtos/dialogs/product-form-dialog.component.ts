import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService, Product, CreateProductDTO } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{isEdit ? 'Editar' : 'Novo'}} Produto</h2>
    
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <!-- Imagem -->
          <div class="image-upload">
            <div class="preview" 
                 [class.has-image]="imagePreview"
                 (click)="fileInput.click()">
              <img *ngIf="imagePreview" [src]="resolvePreview(imagePreview)" alt="Preview">
              <mat-icon *ngIf="!imagePreview">add_photo_alternate</mat-icon>
              <div class="overlay">
                <mat-icon>edit</mat-icon>
              </div>
            </div>
            <input #fileInput type="file" 
                   accept="image/*" 
                   (change)="onImageSelected($event)"
                   style="display: none">
            <button *ngIf="imagePreview" 
                    type="button"
                    mat-icon-button 
                    color="warn"
                    (click)="removeImage()">
              <mat-icon>delete</mat-icon>
            </button>
          </div>

          <!-- Informações Básicas -->
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="productForm.get('name')?.hasError('required')">
                Nome é obrigatório
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoria</mat-label>
              <mat-select formControlName="category_id" required>
                <mat-option *ngFor="let category of categories" [value]="category.id">
                  {{category.name}}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="productForm.get('category_id')?.hasError('required')">
                Categoria é obrigatória
              </mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Descrição</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <!-- Códigos -->
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>SKU</mat-label>
              <input matInput formControlName="sku" required>
              <button type="button" 
                      mat-icon-button 
                      matSuffix
                      (click)="generateSku()"
                      matTooltip="Gerar SKU">
                <mat-icon>autorenew</mat-icon>
              </button>
              <mat-error *ngIf="productForm.get('sku')?.hasError('required')">
                SKU é obrigatório
              </mat-error>
              <mat-error *ngIf="productForm.get('sku')?.hasError('skuExists')">
                SKU já existe
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Código de Barras</mat-label>
              <input matInput formControlName="barcode">
              <mat-error *ngIf="productForm.get('barcode')?.hasError('barcodeExists')">
                Código de barras já existe
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Preço e Estoque -->
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Preço</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="price" 
                     required
                     min="0"
                     step="0.01">
              <span matPrefix>R$&nbsp;</span>
              <mat-error *ngIf="productForm.get('price')?.hasError('required')">
                Preço é obrigatório
              </mat-error>
              <mat-error *ngIf="productForm.get('price')?.hasError('min')">
                Preço deve ser maior que zero
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quantidade em Estoque</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="stock_quantity" 
                     required
                     min="0">
              <mat-error *ngIf="productForm.get('stock_quantity')?.hasError('required')">
                Quantidade é obrigatória
              </mat-error>
              <mat-error *ngIf="productForm.get('stock_quantity')?.hasError('min')">
                Quantidade não pode ser negativa
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estoque Mínimo</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="min_stock_quantity" 
                     required
                     min="0">
              <mat-error *ngIf="productForm.get('min_stock_quantity')?.hasError('required')">
                Estoque mínimo é obrigatório
              </mat-error>
              <mat-error *ngIf="productForm.get('min_stock_quantity')?.hasError('min')">
                Estoque mínimo não pode ser negativo
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Status -->
          <div class="form-row status-row">
            <mat-slide-toggle formControlName="is_active" color="primary">
              Produto Ativo
            </mat-slide-toggle>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button type="button" 
                mat-button 
                [disabled]="loading"
                (click)="dialogRef.close()">
          Cancelar
        </button>
        <button type="submit"
                mat-raised-button
                color="primary"
                [disabled]="productForm.invalid || loading">
          <mat-icon *ngIf="loading">
            <mat-spinner diameter="20"></mat-spinner>
          </mat-icon>
          <span *ngIf="!loading">{{isEdit ? 'Salvar' : 'Criar'}}</span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row > * {
      flex: 1;
    }

    .status-row {
      margin-top: 8px;
    }

    .image-upload {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .preview {
      width: 150px;
      height: 150px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .preview.has-image {
      border-style: solid;
    }

    .preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .preview:hover .overlay {
      opacity: 1;
    }

    .preview .overlay mat-icon {
      color: white;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .preview {
        width: 100px;
        height: 100px;
      }
    }
  `]
})
export class ProductFormDialogComponent implements OnInit {
  productForm: FormGroup;
  categories: any[] = [];
  loading = false;
  isEdit = false;
  imagePreview: string | null = null;
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product }
  ) {
    this.isEdit = !!data.product;
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category_id: ['', Validators.required],
      sku: ['', Validators.required],
      barcode: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      stock_quantity: ['', [Validators.required, Validators.min(0)]],
      min_stock_quantity: ['', [Validators.required, Validators.min(0)]],
      is_active: [true]
    });

    if (this.isEdit) {
      if (data.product) {
        this.productForm.patchValue(data.product);
        this.imagePreview = data.product.image_url || null;
      }
    }
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupValidators();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => this.categories = response.data,
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.snackBar.open('Erro ao carregar categorias', 'Fechar', { duration: 3000 });
      }
    });
  }

  private setupValidators(): void {
    const skuControl = this.productForm.get('sku');
    const barcodeControl = this.productForm.get('barcode');

    if (skuControl) {
      skuControl.valueChanges.subscribe(value => {
        if (value) {
          this.productService.validateSku(value, this.data.product?.id).subscribe({
            next: (response) => {
              if (!response.valid) {
                skuControl.setErrors({ skuExists: true });
              }
            }
          });
        }
      });
    }

    if (barcodeControl) {
      barcodeControl.valueChanges.subscribe(value => {
        if (value) {
          this.productService.validateBarcode(value, this.data.product?.id).subscribe({
            next: (response) => {
              if (!response.valid) {
                barcodeControl.setErrors({ barcodeExists: true });
              }
            }
          });
        }
      });
    }
  }

  generateSku(): void {
    this.productService.generateSku().subscribe({
      next: (response) => {
        this.productForm.patchValue({ sku: response.sku });
      },
      error: (error) => {
        console.error('Erro ao gerar SKU:', error);
        this.snackBar.open('Erro ao gerar SKU', 'Fechar', { duration: 3000 });
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    if (this.isEdit && this.data.product?.image_url) {
      this.productService.deleteImage(this.data.product?.id || 0).subscribe();
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const productData: CreateProductDTO = {
        ...this.productForm.value
      };

      if (this.imageFile) {
        productData.image = this.imageFile;
      }

      const request = this.isEdit
        ? this.productService.updateProduct({ id: this.data.product!.id, ...productData })
        : this.productService.createProduct(productData);

      request.subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erro ao salvar produto:', error);
          this.snackBar.open('Erro ao salvar produto', 'Fechar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resolvePreview(previewUrl: string): string {
    if (!previewUrl) return '';
    if (previewUrl.startsWith('data:')) return previewUrl;
    if (previewUrl.startsWith('http://') || previewUrl.startsWith('https://')) return previewUrl;
    if (previewUrl.startsWith('/storage/') || previewUrl.startsWith('storage/')) {
      const base = environment.apiUrl.replace(/\/api$/, '');
      const path = previewUrl.startsWith('/') ? previewUrl : `/${previewUrl}`;
      return `${base}${path}`;
    }
    return previewUrl;
  }
}
