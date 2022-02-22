import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { differenceInSeconds } from 'date-fns';
import { Subject, takeUntil } from 'rxjs';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastOptions, ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  public toasts: Array<ToastOptions>;

  constructor(public toastService: ToastService, private loggerService: LoggerService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.toastService.toastCollection
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (toasts) => {
          this.toasts = toasts;
        },
        error: (error) => {
          this.loggerService.logError(error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Get the toast notification header based on the type
   * @param toast ToastOptions instance
   * @returns Toast header as string
   */
  public getToastHeader(toast: ToastOptions): string {
    if (toast.type === 'error') return 'Error';
    return 'Information';
  }

  /**
   * Get the toast notification style based on the type
   * @param toast ToastOptions instance
   * @returns CSS class as string
   */
  public getToastHeaderClass(toast: ToastOptions): string {
    if (toast.type === 'error') return 'toast-color-error';
    return 'toast-color-default';
  }

  /**
   * Get the the time interval of the notification appearance
   * @param toast ToastOptions instance
   * @returns Time interval as string
   */
  public getToastTime(toast: ToastOptions): string {
    const difference = differenceInSeconds(toast.timestamp, new Date(Date.now()));

    if (difference > 5) {
      return `${difference} seconds ago.`;
    }

    return 'Now';
  }

  /**
   * Hide a given toast
   * @param toast ToastOptions instance
   */
  public dissmisToast(toast: ToastOptions): void {
    this.toastService.hide(toast);
  }
}
