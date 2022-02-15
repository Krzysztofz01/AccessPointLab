import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingIndicatorService } from '../services/loading-indicator.service';

@Injectable()
export class LoadingIndicatorInterceptor implements HttpInterceptor {

  constructor(public loadingIndicatorService: LoadingIndicatorService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.loadingIndicatorService.isLoading.next(true);
    
    return next.handle(request).pipe(
      finalize(() => {
        this.loadingIndicatorService.isLoading.next(false);
      })
    );
  }
}
