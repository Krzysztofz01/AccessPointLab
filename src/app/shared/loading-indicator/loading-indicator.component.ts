import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LoadingIndicatorService } from 'src/app/core/services/loading-indicator.service';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.css']
})
export class LoadingIndicatorComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public isLoading: boolean = false;

  constructor(public loadingIndicatorService: LoadingIndicatorService) { }
 
  ngOnInit(): void {
    this.loadingIndicatorService.isLoading
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => this.isLoading = status,
        error: (error) => console.error(error)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
