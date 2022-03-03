import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastCollectionSubject = new BehaviorSubject<Array<ToastOptions>>(undefined);

  public toastCollection = this.toastCollectionSubject
    .pipe(map(toast => {
      return toast.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    }));

  constructor() {
    this.toastCollectionSubject.next(new Array<ToastOptions>());
  }

  /**
   * Create a new information notification toast
   * @param message Toast message content
   */
  public setInformation(message: string): void {
    const toast: ToastOptions = {
      type: 'info',
      message: message,
      timestamp: new Date(Date.now())
    };
    
    this.toastCollectionSubject.next([...this.toastCollectionSubject.getValue(), toast]);

    setTimeout(() => {
      this.hide(toast);
    }, 5000);
  }

  /**
   * Create a new error notification toast
   * @param message Toast message content
   */
  public setError(message: string): void {
    const toast: ToastOptions = {
      type: 'error',
      message: message,
      timestamp: new Date(Date.now())
    };
    
    this.toastCollectionSubject.next([...this.toastCollectionSubject.getValue(), toast]);

    setTimeout(() => {
      this.hide(toast);
    }, 3000);
  }

  /**
   * Hide (remove from toast collection) a given toast notification
   * @param toast Toast instance to hide
   */
  public hide(toast: ToastOptions): void {
    this.toastCollectionSubject.next([...this.toastCollectionSubject.getValue().filter(t => t !== toast)]);
  }
}

export interface ToastOptions {
  type: string;
  message: string;
  timestamp: Date;
}
