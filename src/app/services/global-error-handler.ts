import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    if (chunkFailedMessage.test(error.message)) {
      window.location.reload();
      return;
    }

    console.error("Global error:", error);

    //TODO: need to set this to a logging service for production
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}
