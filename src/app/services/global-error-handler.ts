import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    
    if (chunkFailedMessage.test(error.message)) {
      window.location.reload();
      return;
    }
    
    console.error('Global error:', error);
    
    // In production, you would send this to a logging service
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}