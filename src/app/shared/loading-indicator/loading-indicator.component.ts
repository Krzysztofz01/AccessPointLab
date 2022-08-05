import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoadingIndicatorService } from 'src/app/core/services/loading-indicator.service';
import { LoggerService } from 'src/app/core/services/logger.service';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.css']
})
export class LoadingIndicatorComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public isLoading: boolean = false;

  constructor(
    public loadingIndicatorService: LoadingIndicatorService,
    private loggerService: LoggerService) { }
 
  ngOnInit(): void {
    this.loadingIndicatorService.isLoading
      .pipe(takeUntil(this.destroy$))
      .pipe(delay(0))
      .subscribe({
        next: (status) => this.isLoading = status,
        error: (error) => this.loggerService.logError(error)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
