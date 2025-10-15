import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { OrderStatus } from '../../../services/order.service';

interface DialogData {
  currentStatus: OrderStatus;
}

@Component({
  selector: 'app-update-order-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Atualizar Status do Pedido</h2>
    <mat-dialog-content>
      <div class="status-options">
        <mat-radio-group [(ngModel)]="selectedStatus" class="status-radio-group">
          <mat-radio-button *ngFor="let status of availableStatuses" 
                           [value]="status.value"
                           [disabled]="status.disabled"
                           class="status-radio-button">
            {{status.label}}
          </mat-radio-button>
        </mat-radio-group>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button 
              color="primary"
              [disabled]="!selectedStatus || selectedStatus === data.currentStatus"
              (click)="onConfirm()">
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .status-radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 12px 0;
    }
    .status-radio-button {
      margin: 6px 0;
    }
  `]
})
export class UpdateOrderStatusDialogComponent {
  selectedStatus!: OrderStatus;
  availableStatuses: { value: OrderStatus; label: string; disabled: boolean }[];

  constructor(
    public dialogRef: MatDialogRef<UpdateOrderStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.selectedStatus = this.data.currentStatus;
    
    // Definir opções de status disponíveis com base no status atual
    this.availableStatuses = [
      { 
        value: 'pending', 
        label: 'Pendente',
        disabled: this.data.currentStatus !== 'pending' && this.data.currentStatus !== 'delivering'
      },
      { 
        value: 'delivering', 
        label: 'Em Entrega',
        disabled: this.data.currentStatus !== 'pending' && this.data.currentStatus !== 'delivering'
      },
      { 
        value: 'completed', 
        label: 'Concluído',
        disabled: this.data.currentStatus !== 'delivering'
      },
      { 
        value: 'cancelled', 
        label: 'Cancelado',
        disabled: this.data.currentStatus === 'completed' || this.data.currentStatus === 'cancelled'
      }
    ];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedStatus);
  }
}