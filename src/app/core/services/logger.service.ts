import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  
  /**
   * Log information to configured log output
   * @param message Message to log
   */
  public logInformation(message: string): void {
    if (!environment.LOG_INFO) return;

    console.log(this.prepareLogMessage('Info', message));
  }

  /**
   * log error to configured log output
   * @param error Exception instance
   * @param message Additional, optional message to log
   */
  public logError(error: Error | string, message: string = undefined): void {
    if (!environment.LOG_ERROR) return;

    if (error instanceof Error) {
      const formatedMessage = (message === undefined)
        ? this.prepareLogMessage('Error', error.message)
        : this.prepareLogMessage('Error', `${message} ${error.message}`);

      if (environment.LOG_SINGLE_LEVEL) {
        console.log(formatedMessage);
        return;
      }
      console.error(formatedMessage);
    } else {
      const formatedMessage =  this.prepareLogMessage('Error', error as string);
      
      if (environment.LOG_SINGLE_LEVEL) {
        console.log(formatedMessage);
        return;
      }
      console.error(formatedMessage);
    }
  }

  /**
   * Format the the message to log
   * @param prefix Log type prefix
   * @param message Message to log
   * @returns Formated log message
   */
  private prepareLogMessage(prefix: string, message: string): string {
    return `[${prefix.toUpperCase()}] - ${message}`;
  }
}
