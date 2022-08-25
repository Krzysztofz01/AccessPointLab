import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {catchError, map} from 'rxjs/operators'
import { LoadingIndicatorService } from '../services/loading-indicator.service';

@Injectable()
export class LoadingIndicatorInterceptor implements HttpInterceptor {

  constructor(public loadingIndicatorService: LoadingIndicatorService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const loadingId = request.urlWithParams;
    this.loadingIndicatorService.setLoading(loadingId, true);

    return next.handle(request)
      .pipe(catchError((err) => {
        this.loadingIndicatorService.setLoading(loadingId, false);
        
        return err;
      }))
      .pipe(map<any, any>((event) => {
        if (event instanceof HttpResponse) {
          this.loadingIndicatorService.setLoading(loadingId, false);
        }

        return event;
      }));
  }
}
