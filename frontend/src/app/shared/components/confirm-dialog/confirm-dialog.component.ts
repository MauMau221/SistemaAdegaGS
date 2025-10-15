import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    
    <mat-dialog-content>
      <p>{{data.message}}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button
              (click)="dialogRef.close(false)">
        {{data.cancelText || 'Cancelar'}}
      </button>
      <button mat-raised-button
              [color]="getButtonColor()"
              (click)="dialogRef.close(true)">
        {{data.confirmText || 'Confirmar'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 300px;
    }

    p {
      margin: 16px 0;
      color: #666;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getButtonColor(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warn';
      case 'danger':
        return 'warn';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  }
}
