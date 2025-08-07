import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: Error | any): void {
    let message = 'An unexpected error occurred';
    
    if (error.message) {
      message = error.message;
    } else if (error.status) {
      message = `Error ${error.status}: ${error.statusText || 'Server error'}`;
    }
    
    console.error('Error occurred:', error);
    
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}