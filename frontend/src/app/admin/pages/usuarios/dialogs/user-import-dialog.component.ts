import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatListModule
  ],
  template: `
    <h2 mat-dialog-title>Importar Usuários</h2>
    
    <mat-dialog-content>
      <div class="import-container">
        <!-- Área de Upload -->
        <div class="upload-area" 
             [class.drag-over]="isDragging"
             [class.has-file]="selectedFile"
             [class.has-errors]="errors.length > 0"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          
          <input #fileInput 
                 type="file"
                 accept=".csv,.xlsx"
                 (change)="onFileSelected($event)"
                 style="display: none">

          <mat-icon>{{getUploadIcon()}}</mat-icon>
          
          <div class="upload-text">
            <ng-container *ngIf="!selectedFile">
              <p>Arraste e solte seu arquivo aqui</p>
              <p>ou</p>
              <p>clique para selecionar</p>
              <small>Formatos aceitos: CSV, XLSX</small>
            </ng-container>
            <ng-container *ngIf="selectedFile">
              <p>{{selectedFile.name}}</p>
              <small>{{formatFileSize(selectedFile.size)}}</small>
            </ng-container>
          </div>
        </div>

        <!-- Erros -->
        <div class="errors-section" *ngIf="errors.length > 0">
          <h3>Erros na Importação</h3>
          <mat-list>
            <mat-list-item *ngFor="let error of errors">
              <mat-icon matListItemIcon color="warn">error</mat-icon>
              <span matListItemTitle>{{error}}</span>
            </mat-list-item>
          </mat-list>
        </div>

        <!-- Template -->
        <div class="template-section">
          <p>Baixe nosso template para importação:</p>
          <button mat-stroked-button (click)="downloadTemplate('xlsx')">
            <mat-icon>download</mat-icon>
            Template XLSX
          </button>
          <button mat-stroked-button (click)="downloadTemplate('csv')">
            <mat-icon>download</mat-icon>
            Template CSV
          </button>
        </div>

        <!-- Progress -->
        <mat-progress-bar *ngIf="importing"
                         mode="indeterminate">
        </mat-progress-bar>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button 
              [disabled]="importing"
              (click)="dialogRef.close()">
        Cancelar
      </button>
      <button mat-raised-button
              color="primary"
              [disabled]="!selectedFile || importing"
              (click)="importFile()">
        Importar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .import-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 16px 0;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .upload-area.drag-over {
      border-color: #3f51b5;
      background-color: rgba(63, 81, 181, 0.05);
    }

    .upload-area.has-file {
      border-style: solid;
      border-color: #4caf50;
      background-color: rgba(76, 175, 80, 0.05);
    }

    .upload-area.has-errors {
      border-color: #f44336;
      background-color: rgba(244, 67, 54, 0.05);
    }

    .upload-area mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
      margin-bottom: 16px;
    }

    .upload-text {
      color: #666;
    }

    .upload-text p {
      margin: 4px 0;
    }

    .upload-text small {
      color: #999;
    }

    .errors-section {
      background-color: #fff3f2;
      border-radius: 8px;
      padding: 16px;
    }

    .errors-section h3 {
      color: #d32f2f;
      margin: 0 0 16px;
      font-size: 16px;
    }

    .template-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .template-section p {
      margin: 0;
      color: #666;
    }

    @media (max-width: 600px) {
      .template-section {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class UserImportDialogComponent {
  selectedFile: File | null = null;
  isDragging = false;
  importing = false;
  errors: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<UserImportDialogComponent>,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'text/csv' // csv
    ];

    if (!validTypes.includes(file.type)) {
      this.snackBar.open('Formato de arquivo inválido. Use CSV ou XLSX.', 'Fechar', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
    this.errors = [];
  }

  importFile(): void {
    if (!this.selectedFile) return;

    this.importing = true;
    this.errors = [];

    this.userService.importUsers(this.selectedFile).subscribe({
      next: (result) => {
        if (result.errors.length > 0) {
          this.errors = result.errors;
          this.snackBar.open(
            `Importação concluída com ${result.errors.length} erros.`,
            'Fechar',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `${result.imported} usuários importados com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        }
        this.importing = false;
      },
      error: (error) => {
        console.error('Erro na importação:', error);
        this.snackBar.open('Erro ao importar usuários', 'Fechar', { duration: 3000 });
        this.importing = false;
      }
    });
  }

  downloadTemplate(format: 'csv' | 'xlsx'): void {
    this.userService.exportUsers(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template_usuarios.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao baixar template:', error);
        this.snackBar.open('Erro ao baixar template', 'Fechar', { duration: 3000 });
      }
    });
  }

  getUploadIcon(): string {
    if (this.errors.length > 0) return 'error';
    if (this.selectedFile) return 'description';
    return 'cloud_upload';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
